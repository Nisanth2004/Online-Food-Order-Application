package com.nisanth.foodapi.service;

import com.nisanth.foodapi.entity.*;
import com.nisanth.foodapi.enumeration.OrderStatus;
import com.nisanth.foodapi.io.*;
import com.nisanth.foodapi.io.order.OrderItem;
import com.nisanth.foodapi.io.order.OrderRequest;
import com.nisanth.foodapi.io.order.OrderResponse;
import com.nisanth.foodapi.io.util.DeliveryMessage;
import com.nisanth.foodapi.repository.*;
import com.nisanth.foodapi.repository.offers.ComboRepository;
import com.nisanth.foodapi.repository.offers.CouponRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class OrderServiceImpl implements OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CourierRepository courierRepository;

    @Autowired
    private ComboRepository comboRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private DeliveryBoyRepository deliveryBoyRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private CouponRepository couponRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private SpringTemplateEngine templateEngine;

    @Autowired
    private FoodRepository foodRepository;

    @Autowired
    private FoodService foodService;


    @Autowired
    private SettingService settingService;
    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private ShipTrackingService shipTrackingService;


    // ------------------- CREATE ORDER -------------------
    @Override
    public OrderResponse createOrderWithPayment(OrderRequest request) throws RazorpayException {
        if (request.getOrderedItems() == null || request.getOrderedItems().isEmpty()) {
            throw new RuntimeException("No ordered items provided");
        }

        Setting s = settingService.getSettings();
        String RAZORPAY_KEY = s.getRazorpayKey();

        Setting s1 = settingService.getSettings();
        String RAZORPAY_SECRET = s1.getRazorpaySecret();

        List<OrderItem> reservedList = new ArrayList<>();
        try {
            for (OrderItem item : request.getOrderedItems()) {

                if (item.getQuantity() == null || item.getQuantity() <= 0) {
                    throw new RuntimeException("Invalid quantity");
                }

                if ("FOOD".equalsIgnoreCase(item.getType())) {

                    if (item.getFoodId() == null) {
                        throw new RuntimeException("Food ID missing");
                    }

                    boolean reserved = foodService.tryReserveStock(
                            item.getFoodId(),
                            item.getQuantity()
                    );

                    if (!reserved) {
                        throw new RuntimeException("Insufficient stock for food");
                    }

                    reservedList.add(item);
                }

                else if ("COMBO".equalsIgnoreCase(item.getType())) {

                    if (item.getComboId() == null) {
                        throw new RuntimeException("Combo ID missing");
                    }

                    // 🔒 No stock reservation for combo (or handle later if needed)
                    reservedList.add(item);
                }

                else {
                    throw new RuntimeException("Invalid item type");
                }
            }


            OrderEntity newOrder = convertToEntity(request);
            newOrder.setOrderStatus(OrderStatus.ORDER_PLACED);
            newOrder.getStatusTimestamps().put(String.valueOf(OrderStatus.ORDER_PLACED), LocalDateTime.now());

            newOrder = orderRepository.save(newOrder);

            RazorpayClient razorpayClient = new RazorpayClient(RAZORPAY_KEY, RAZORPAY_SECRET);
            JSONObject orderRequest = new JSONObject();
            int amountPaise = (int) Math.round(newOrder.getAmount() * 100);
            orderRequest.put("amount", amountPaise);

            orderRequest.put("currency", "INR");
            orderRequest.put("payment_capture", 1);

            Order razorpayOrder = razorpayClient.orders.create(orderRequest);
            newOrder.setRazorpayOrderId(razorpayOrder.get("id"));

            String loggedInUserId = userService.findByUserId();
            newOrder.setUserId(loggedInUserId);
            orderRepository.save(newOrder);

            return convertToResponse(newOrder);

        } catch (RuntimeException ex) {
            for (OrderItem r : reservedList) {

                if ("FOOD".equalsIgnoreCase(r.getType())) {
                    try {
                        foodService.releaseReservedStock(
                                r.getFoodId(),
                                r.getQuantity()
                        );
                    } catch (Exception ignore) {}
                }
            }

            throw ex;
        }
    }

    // ------------------- VERIFY PAYMENT -------------------
    @Override
    public void verifyPayment(Map<String, String> paymentData, String status) {
        String razorpayOrderId = paymentData.get("razorpay_order_id");

        OrderEntity existingOrder = orderRepository.findByRazorpayOrderId(razorpayOrderId)
                .orElseThrow(() -> new RuntimeException("Order Not Found"));

        existingOrder.setPaymentStatus(status);
        existingOrder.setRazorPaySignature(paymentData.get("razorpay_signature"));
        existingOrder.setRazorpayPaymentId(paymentData.get("razorpay_payment_id"));
        orderRepository.save(existingOrder);

        if ("paid".equalsIgnoreCase(status)) {
            cartRepository.deleteByUserId(existingOrder.getUserId());
            String emailBody = generateOrderEmailHtml(existingOrder);
            emailService.sendOrderEmail(
                    existingOrder.getEmail(),
                    "Your Order Confirmation - " + existingOrder.getId(),
                    emailBody
            );
        }
    }

    // ------------------- GET ORDERS -------------------
    @Override
    public List<OrderResponse> getUserOrders() {
        String loggedInUserId = userService.findByUserId();
        List<OrderEntity> list = orderRepository.findByUserId(loggedInUserId);
        return list.stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    @Override
    public OrderResponse getOrderById(String orderId) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        return convertToResponse(order);
    }

    @Override
    public List<OrderResponse> getOrdersOfAllUsers() {
        List<OrderEntity> list = orderRepository.findAll();
        return list.stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    @Override
    public List<OrderResponse> getOrdersFiltered(String userId, String phone) {
        List<OrderEntity> list;
        if (userId != null && !userId.isBlank()) list = orderRepository.findByUserId(userId);
        else if (phone != null && !phone.isBlank()) list = orderRepository.findByPhoneNumber(phone);
        else list = orderRepository.findAll();
        return list.stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    // ------------------- UPDATE STATUS -------------------
    @Override
    public void updateOrderStatus(String orderId, String status) {
        OrderEntity entity = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order Not found"));

        try {
            OrderStatus orderStatus = OrderStatus.fromString(status);
            entity.setOrderStatus(orderStatus);
            entity.getStatusTimestamps().put(String.valueOf(orderStatus), LocalDateTime.now());
            orderRepository.save(entity);
            messagingTemplate.convertAndSend("/topic/orders", convertToResponse(entity));
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid order status: " + status);
        }
    }


    // ------------------- CANCEL / APPROVE -------------------
    @Override
    public void cancelOrder(String orderId) {
        String loggedInUserId = userService.findByUserId();
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getUserId().equals(loggedInUserId)) throw new RuntimeException("Unauthorized");

        if (order.getOrderStatus() == OrderStatus.CANCELLED) return;
        if (order.getOrderStatus() == OrderStatus.DELIVERED)
            throw new RuntimeException("Delivered orders cannot be cancelled");

        if (!order.isStockRestored()) {
            restoreReservedStock(order);
            order.setStockRestored(true);
        }

        order.setOrderStatus(OrderStatus.CANCELLED);
        order.getStatusTimestamps().put(String.valueOf(OrderStatus.CANCELLED), LocalDateTime.now());
        orderRepository.save(order);
    }

    @Override
    public void requestCancelOrder(String orderId) {
        String loggedInUserId = userService.findByUserId();
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getUserId().equals(loggedInUserId)) throw new RuntimeException("Unauthorized");

        if (order.getOrderStatus() == OrderStatus.DELIVERED ||
                order.getOrderStatus() == OrderStatus.CANCELLED ||
                order.getOrderStatus() == OrderStatus.CANCEL_REQUESTED) {
            throw new RuntimeException("Cannot cancel this order");
        }

        order.setOrderStatus(OrderStatus.CANCEL_REQUESTED);
        order.getStatusTimestamps().put(String.valueOf(OrderStatus.CANCEL_REQUESTED), LocalDateTime.now());
        orderRepository.save(order);
    }

    @Override
    public void approveCancelOrder(String orderId) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getOrderStatus() != OrderStatus.CANCEL_REQUESTED)
            throw new RuntimeException("Order not requested for cancellation");

        if (!order.isStockRestored()) {
            restoreReservedStock(order);
            order.setStockRestored(true);
        }

        order.setOrderStatus(OrderStatus.CANCELLED);
        order.getStatusTimestamps().put(String.valueOf(OrderStatus.CANCELLED), LocalDateTime.now());
        orderRepository.save(order);
    }

    // ------------------- COURIER -------------------
    /*
    @Override
    public void updateCourierDetails(String orderId, String courierName, String trackingId) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NoSuchElementException("Order not found"));

        Courier courier = courierRepository.findByName(courierName)
                .orElseThrow(() -> new NoSuchElementException("Courier not found"));

        order.setCourierName(courierName);
        order.setCourierTrackingId(trackingId);
        order.setCourierTrackUrl(courier.getTrackUrl());

        order.setOrderStatus(OrderStatus.ORDER_PACKED);
        order.getStatusTimestamps().put(String.valueOf(OrderStatus.ORDER_PACKED), LocalDateTime.now());

        orderRepository.save(order);
    }
*/
    @Override
    public void updateCourierDetails(String orderId, String courierName, String trackingId) {
        OrderEntity order = orderRepository.findById(orderId).orElseThrow();

        order.setCourierName(courierName);
        order.setCourierTrackingId(trackingId);
        order.setOrderStatus(OrderStatus.SHIPPED);

        order.addMessage("Order shipped via " + courierName, LocalDateTime.now(), "system", null);

        orderRepository.save(order);

        // Register with ShipTracker
        try {
            shipTrackingService.registerTracking(courierName, trackingId);
        } catch (Exception e) {
            System.out.println("ShipTracker register failed: " + e.getMessage());
        }
    }


    // ------------------- STOCK HELPERS -------------------
    private void restoreReservedStock(OrderEntity order) {
        if (order.getOrderedItems() == null) return;
        for (var item : order.getOrderedItems()) {
            try {
                if ("FOOD".equalsIgnoreCase(item.getType())) {
                    foodService.releaseReservedStock(
                            item.getFoodId(),
                            item.getQuantity()
                    );
                }

            } catch (Exception e) {
                throw new RuntimeException("Failed to restore stock for item: " + item.getFoodId(), e);
            }
        }
    }

    // ------------------- EMAIL -------------------
    public String generateOrderEmailHtml(OrderEntity order) {
        Context context = new Context();
        context.setVariable("order", order);
        return templateEngine.process("order-success-email", context);
    }

    // ------------------- ENTITY / RESPONSE CONVERSION -------------------
    private OrderEntity convertToEntity(OrderRequest request) {

        Setting setting = settingService.getSettings();
        double taxRate = setting.getTaxPercentage() != null ? setting.getTaxPercentage() : 0.0;
        double shipping = setting.getShippingCharge() != null ? setting.getShippingCharge() : 0.0;

        OrderStatus status = OrderStatus.ORDER_PLACED;
        if (request.getOrderStatus() != null) {
            try {
                status = OrderStatus.valueOf(request.getOrderStatus().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Invalid order status: " + request.getOrderStatus());
            }
        }

        List<OrderItem> finalItems = new ArrayList<>();

        // ✅ FIX: pricing calculated PER ITEM
        for (OrderItem item : request.getOrderedItems()) {

            if ("FOOD".equalsIgnoreCase(item.getType())) {

                if (item.getFoodId() == null) {
                    throw new RuntimeException("Food ID missing");
                }

                FoodEntity food = foodRepository.findById(item.getFoodId())
                        .orElseThrow(() -> new RuntimeException("Food not found"));

                double mrp = food.getMrp();
                double sellingPrice = foodService.getEffectivePrice(food);

                int discount = (mrp > sellingPrice)
                        ? (int) Math.round(((mrp - sellingPrice) / mrp) * 100)
                        : 0;

                finalItems.add(OrderItem.builder()
                        .type("FOOD")
                        .foodId(food.getId())
                        .quantity(item.getQuantity())
                        .mrp(mrp)
                        .sellingPrice(sellingPrice)
                        .discountPercentage(discount)
                        .offerLabel(discount > 0 ? discount + "% OFF" : null)
                        .price(sellingPrice)
                        .name(food.getName())
                        .description(food.getDescription())
                        .imageUrl(food.getImageUrl())
                        .category(
                                food.getCategoryIds() != null && !food.getCategoryIds().isEmpty()
                                        ? food.getCategoryIds().get(0)
                                        : null
                        )
                        .build());
            }

            else if ("COMBO".equalsIgnoreCase(item.getType())) {

                if (item.getComboId() == null) {
                    throw new RuntimeException("Combo ID missing");
                }

                ComboEntity combo = comboRepository.findById(item.getComboId())
                        .orElseThrow(() -> new RuntimeException("Combo not found"));

                double mrp = combo.getOriginalPrice();
                double sellingPrice = combo.getComboPrice();

                int discount = (mrp > sellingPrice)
                        ? (int) Math.round(((mrp - sellingPrice) / mrp) * 100)
                        : 0;

                finalItems.add(OrderItem.builder()
                        .type("COMBO")
                        .comboId(combo.getId())
                        .quantity(item.getQuantity())

                        // ✅ CORRECT PRICE FIELDS
                        .mrp(mrp)
                        .sellingPrice(sellingPrice)
                        .discountPercentage(discount)
                        .offerLabel(discount > 0 ? discount + "% OFF" : null)

                        .price(sellingPrice)
                        .name(combo.getName())
                        .description("Combo Offer")
                        .imageUrl(combo.getImageUrl())
                        .category("COMBO")
                        .build());
            }

            else {
                throw new RuntimeException("Invalid item type");
            }
        }


        double subtotal = finalItems.stream()
                .mapToDouble(i -> i.getQuantity() * i.getPrice())
                .sum();

        double discountedSubtotal = applyCoupon(request.getCouponCode(), subtotal);

        double tax = discountedSubtotal * (taxRate / 100.0);
        double grandTotal = discountedSubtotal + tax + shipping;

        Courier defaultCourier = courierRepository.findByIsDefaultTrue().orElse(null);
        if (defaultCourier != null) {
            request.setCourierName(defaultCourier.getName());
            request.setCourierTrackUrl(defaultCourier.getTrackUrl());
        }
        double discountAmount = subtotal - discountedSubtotal;


        return OrderEntity.builder()
                .userAddress(request.getUserAddress())
                .phoneNumber(request.getPhoneNumber())
                .email(request.getEmail())
                .orderedItems(finalItems)

                .couponCode(request.getCouponCode())
                .discountAmount(discountAmount)

                .amount(grandTotal)
                .orderStatus(status)
                .statusTimestamps(new HashMap<>())
                .courierName(request.getCourierName())
                .courierTrackUrl(request.getCourierTrackUrl())
                .stockRestored(false)
                .build();
    }


    private OrderResponse convertToResponse(OrderEntity newOrder) {
        double subtotal = newOrder.getOrderedItems() != null
                ? newOrder.getOrderedItems().stream()
                .mapToDouble(i ->
                        (i.getQuantity() != null ? i.getQuantity() : 0) * i.getPrice()
                )
                .sum()
                : 0;



        Setting setting = settingService.getSettings();
        double taxRate = setting.getTaxPercentage() != null ? setting.getTaxPercentage() : 0.0;
        double shipping = setting.getShippingCharge() != null ? setting.getShippingCharge() : 0.0;

        double tax = subtotal * (taxRate / 100.0);
        double grandTotal = subtotal + tax + shipping;

        return OrderResponse.builder()
                .id(newOrder.getId())
                .amount(newOrder.getAmount())
                .subtotal(subtotal)
                .tax(tax)
                .taxRate(taxRate)
                .shipping(shipping)
                .grandTotal(grandTotal)
                .userAddress(newOrder.getUserAddress())
                .userId(newOrder.getUserId())
                .razorpayOrderId(newOrder.getRazorpayOrderId())
                .paymentStatus(newOrder.getPaymentStatus())
                .orderStatus(newOrder.getOrderStatus() != null ? newOrder.getOrderStatus().name() : null)
                .email(newOrder.getEmail())
                .courierName(newOrder.getCourierName())
                .courierTrackingId(newOrder.getCourierTrackingId())
                .deliveryMessages(newOrder.getDeliveryMessages())
                .phoneNumber(newOrder.getPhoneNumber())
                .orderedItems(newOrder.getOrderedItems())
                .statusTimestamps(newOrder.getStatusTimestamps())
                .createdDate(newOrder.getCreatedDate() != null ? newOrder.getCreatedDate().toString() : null)
                .build();
    }

    // ------------------- REMOVE ORDER -------------------
    @Override
    public void removeOrder(String orderId) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        orderRepository.delete(order);
    }

    @Override
    public void updateOrderAddress(String orderId, String newAddress) {
        String userId = userService.findByUserId();

        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getUserId().equals(userId))
            throw new RuntimeException("Unauthorized");

        if (order.getOrderStatus().ordinal() >= OrderStatus.SHIPPED.ordinal())
            throw new RuntimeException("Cannot change address after shipping");

        order.setUserAddress(newAddress);
        orderRepository.save(order);
    }

    // Helper: centralised status change that adds timestamp + optional delivery message + websocket publish
    @Override
    public void setOrderStatusWithTimestamp(String orderId, String status, String actor, String message,String reason) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        OrderStatus newStatus = OrderStatus.fromString(status);
        order.setOrderStatus(newStatus);
        order.getStatusTimestamps().put(String.valueOf(newStatus), LocalDateTime.now());

        if (message != null && !message.isBlank()) {
            if (order.getDeliveryMessages() == null) order.setDeliveryMessages(new ArrayList<>());
            order.getDeliveryMessages().add(
                    DeliveryMessage.builder()
                            .message(message)
                            .timestamp(LocalDateTime.now())
                            .actor(actor)
                            .reason(reason)
                            .build()
            );

        }

        orderRepository.save(order);

        // push websocket update if you want to keep realtime UI
        try {
            messagingTemplate.convertAndSend("/topic/orders", convertToResponse(order));
        } catch (Exception ignore) {}
    }

    // List orders for a hub — orders that have last hubHistory entry equal to hubName OR orderStatus == ORDER_AT_HUB
    @Override
    public List<OrderResponse> getOrdersForHub(String hubName) {
        List<OrderEntity> all = orderRepository.findAll();
        // filter: orders where last hubHistory hubName equals this or status == ORDER_AT_HUB and hubName in hubHistory OR assigned hub
        List<OrderEntity> filtered = all.stream().filter(o -> {
            // if hubHistory last equals hubName
            if (o.getHubHistory() != null && !o.getHubHistory().isEmpty()) {
                HubUpdate last = o.getHubHistory().get(o.getHubHistory().size() - 1);
                if (hubName.equalsIgnoreCase(last.getHubName())) return true;
            }
            // fallback: status = ORDER_AT_HUB and delivery boy not assigned
            if (o.getOrderStatus() != null && o.getOrderStatus() == OrderStatus.ORDER_AT_HUB) return true;
            return false;
        }).collect(Collectors.toList());

        return filtered.stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    // List orders for a delivery boy (by assignedDeliveryBoyId) and statuses OUT_FOR_DELIVERY or ORDER_AT_HUB
    @Override
    public List<OrderResponse> getOrdersForDeliveryBoy(String deliveryBoyId) {
        List<OrderEntity> list = orderRepository.findAll().stream()
                .filter(o -> deliveryBoyId.equals(o.getAssignedDeliveryBoyId()))
                .filter(o -> o.getOrderStatus() == OrderStatus.ORDER_AT_HUB || o.getOrderStatus() == OrderStatus.OUT_FOR_DELIVERY)
                .collect(Collectors.toList());
        return list.stream().map(this::convertToResponse).collect(Collectors.toList());
    }
    @Override
    public String savePodImage(String orderId, MultipartFile file) throws Exception {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        String url = fileStorageService.store(file);

        if (order.getPodImageUrls() == null) order.setPodImageUrls(new ArrayList<>());
        order.getPodImageUrls().add(url);

        // add delivery message
        if (order.getDeliveryMessages() == null) order.setDeliveryMessages(new ArrayList<>());
        order.getDeliveryMessages().add(DeliveryMessage.builder()
                .message("POD uploaded")
                .timestamp(LocalDateTime.now())
                .build());

        orderRepository.save(order);
        return url;
    }

    @Override
    public void assignDeliveryBoy(String orderId, String deliveryBoyId) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setAssignedDeliveryBoyId(deliveryBoyId);
        orderRepository.save(order);
    }


    private double applyCoupon(String code, double subtotal) {

        if (code == null || code.isBlank()) return subtotal;

        CouponEntity coupon = couponRepository
                .findByCodeAndActiveTrue(code)
                .orElseThrow(() -> new RuntimeException("Invalid coupon"));

        if (!coupon.isActive())
            throw new RuntimeException("Coupon inactive");

        if (coupon.getExpiryDate() != null &&
                LocalDateTime.now().isAfter(coupon.getExpiryDate()))
            throw new RuntimeException("Coupon expired");

        if (subtotal < coupon.getMinOrderAmount())
            throw new RuntimeException(
                    "Minimum order ₹" + coupon.getMinOrderAmount() + " required"
            );

        double discount = subtotal * coupon.getDiscountPercent() / 100.0;

        return Math.max(subtotal - discount, 0);
    }

}
