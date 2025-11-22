package com.nisanth.foodapi.service;

import com.nisanth.foodapi.entity.FoodEntity;
import com.nisanth.foodapi.entity.OrderEntity;
import com.nisanth.foodapi.enumeration.OrderStatus;
import com.nisanth.foodapi.io.OrderItem;
import com.nisanth.foodapi.io.OrderRequest;
import com.nisanth.foodapi.io.OrderResponse;
import com.nisanth.foodapi.repository.CartRepository;
import com.nisanth.foodapi.repository.FoodRepository;
import com.nisanth.foodapi.repository.OrderRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import lombok.AllArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class OrderServiceImpl implements OrderService{

    @Autowired
    private  OrderRepository orderRepository;

    @Autowired
    private CartRepository cartRepository;
    @Autowired
    private  UserService userService;

    @Autowired
    private FoodRepository foodRepository;

    // NEW: Use foodService to adjust/set stock in a central place
    @Autowired
    private FoodService foodService;

    @Value("${razorpay_key}")
    private String RAZORPAY_KEY;

    @Value("${razorpay_secret}")
    private String RAZORPAY_SECRET;

    @Override
    public OrderResponse createOrderWithPayment(OrderRequest request) throws RazorpayException {

        // Basic request validation
        if (request.getOrderedItems() == null || request.getOrderedItems().isEmpty()) {
            throw new RuntimeException("No ordered items provided");
        }

        // Try to reserve stock for each item atomically.
        // Keep track of successfully reserved items so we can rollback if some later reservation fails.
        List<OrderItem> reservedList = new ArrayList<>();
        try {
            for (OrderItem item : request.getOrderedItems()) {
                if (item.getQuantity() == null || item.getQuantity() <= 0) {
                    throw new RuntimeException("Invalid quantity for item: " + item.getFoodId());
                }

                boolean reserved = foodService.tryReserveStock(item.getFoodId(), item.getQuantity());
                if (!reserved) {
                    throw new RuntimeException("Insufficient stock or item unavailable: " + item.getName());
                }
                reservedList.add(item);
            }

            // All reservations succeeded → create order entity & save (orderStatus CREATED)
            OrderEntity newOrder = convertToEntity(request);
            if (newOrder.getOrderStatus() == null) {
                newOrder.setOrderStatus(OrderStatus.PREPARING);
            }
            newOrder = orderRepository.save(newOrder);

            // create razorpay payment order using razorpay client
            RazorpayClient razorpayClient=new RazorpayClient(RAZORPAY_KEY,RAZORPAY_SECRET);
            JSONObject orderRequest=new JSONObject();
            orderRequest.put("amount",newOrder.getAmount()*100 );
            orderRequest.put("currency","INR");
            orderRequest.put("payment_capture",1);

            // create the order
            Order razorpayOrder= razorpayClient.orders.create(orderRequest);
            newOrder.setRazorpayOrderId(razorpayOrder.get("id"));

            // get the user id
            String loggedInUserId= userService.findByUserId();
            newOrder.setUserId(loggedInUserId);
            orderRepository.save(newOrder);
            return convertToResponse(newOrder);

        } catch (RuntimeException ex) {
            // rollback any reservations previously made
            for (OrderItem r : reservedList) {
                try {
                    foodService.releaseReservedStock(r.getFoodId(), r.getQuantity() != null ? r.getQuantity() : 0);
                } catch (Exception ignore) {
                    // log warning in real app — avoid masking original exception
                }
            }
            throw ex; // rethrow so controller returns error to client
        }
    }

    @Override
    public void verifyPayment(Map<String, String> paymentData, String status) {
        String razorpayOrderId= paymentData.get("razorpay_order_id");

        // get the respective order id
        OrderEntity exisitingOrder=orderRepository.findByRazorpayOrderId(razorpayOrderId)
                .orElseThrow(()->new RuntimeException("Order Not Found"));

        exisitingOrder.setPaymentStatus(status);
        exisitingOrder.setRazorPaySignature(paymentData.get("razorpay_signature"));
        exisitingOrder.setRazorpayPaymentId(paymentData.get("razorpay_payment_id"));
        orderRepository.save(exisitingOrder);

        if("paid".equalsIgnoreCase(status))
        {
            // Stock was already reserved at create, so nothing more to do to stock.
            // If you want to mark any 'finalized' flag in order, you can add it later.

            // Clear cart for user (only after successful payment)
            cartRepository.deleteByUserId(exisitingOrder.getUserId());
        }
    }


    @Override
    public List<OrderResponse> getUserOrders() {
        String loggedInUserId=userService.findByUserId();
        List<OrderEntity> list= orderRepository.findByUserId(loggedInUserId);
        return list.stream().map(entity->convertToResponse(entity)).collect(Collectors.toList());
    }

    @Override
    public void removeOrder(String orderId) {
        orderRepository.deleteById(orderId);

    }

    @Override
    public List<OrderResponse> getOrdersOfAllUsers() {
        List<OrderEntity> list=orderRepository.findAll();
        return list.stream().map(entity->convertToResponse(entity)).collect(Collectors.toList());

    }

    @Override
    public void updateOrderStatus(String orderId, String status) {
        OrderEntity entity = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order Not found"));

        try {
            OrderStatus orderStatus = OrderStatus.fromString(status);
            entity.setOrderStatus(orderStatus);
            orderRepository.save(entity);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid order status: " + status);
        }

    }



    @Override
    public void cancelOrder(String orderId) {
        String loggedInUserId = userService.findByUserId();
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getUserId().equals(loggedInUserId)) {
            throw new RuntimeException("You are not authorized to cancel this order");
        }

        // idempotent: if already cancelled, do nothing
        if (order.getOrderStatus() == OrderStatus.CANCELLED) {
            return;
        }

        if (order.getOrderStatus() == OrderStatus.DELIVERED) {
            throw new RuntimeException("Delivered orders cannot be cancelled");
        }

        // Only release stock if not already restored.
        if (!order.isStockRestored()) {
            restoreReservedStock(order);
            order.setStockRestored(true);
        }

        order.setOrderStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
    }




    private OrderResponse convertToResponse(OrderEntity newOrder) {
        return OrderResponse.builder()
                .id(newOrder.getId())
                .amount(newOrder.getAmount())
                .userAddress(newOrder.getUserAddress())
                .userId(newOrder.getUserId())
                .razorpayOrderId(newOrder.getRazorpayOrderId())
                .paymentStatus(newOrder.getPaymentStatus())
                .orderStatus(newOrder.getOrderStatus() != null
                        ? newOrder.getOrderStatus().name()
                        : null)  // convert enum to String
                .email(newOrder.getEmail())
                .phoneNumber(newOrder.getPhoneNumber())
                .orderedItems(newOrder.getOrderedItems())
                .createdDate(newOrder.getCreatedDate() != null
                        ? newOrder.getCreatedDate().toString()
                        : null)
                .build();
    }


    private OrderEntity convertToEntity(OrderRequest request) {
        OrderStatus status = null;
        if (request.getOrderStatus() != null) {
            try {
                status = OrderStatus.valueOf(request.getOrderStatus().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Invalid order status: " + request.getOrderStatus());
            }
        }

        return OrderEntity.builder()
                .userAddress(request.getUserAddress())
                .amount(request.getAmount())
                .orderedItems(request.getOrderedItems())
                .phoneNumber(request.getPhoneNumber())
                .email(request.getEmail())
                .orderStatus(status)
                .stockRestored(false).build();
    }


    @Override
    public void requestCancelOrder(String orderId) {
        String loggedInUserId = userService.findByUserId();
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getUserId().equals(loggedInUserId)) {
            throw new RuntimeException("You are not authorized to cancel this order");
        }

        if (order.getOrderStatus() == OrderStatus.DELIVERED ||
                order.getOrderStatus() == OrderStatus.CANCELLED ||
                order.getOrderStatus() == OrderStatus.CANCEL_REQUESTED) {
            throw new RuntimeException("This order cannot be cancelled");
        }

        order.setOrderStatus(OrderStatus.CANCEL_REQUESTED);
        orderRepository.save(order);
    }


    @Override
    public void approveCancelOrder(String orderId) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getOrderStatus() != OrderStatus.CANCEL_REQUESTED) {
            throw new RuntimeException("This order has not been requested for cancellation");
        }

        if (!order.isStockRestored()) {
            restoreReservedStock(order);
            order.setStockRestored(true);
        }

        order.setOrderStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
    }



    // stock
    private void restoreStock(OrderEntity order) {
        if (order.getOrderedItems() == null) return;

        for (var item : order.getOrderedItems()) {
            foodService.adjustStock(item.getFoodId(), item.getQuantity());
        }
    }

    /**
            * Helper: restore previously reserved stock for the given order.
     * This releases quantity back to inventory (idempotent via stockRestored flag).
            */
    private void restoreReservedStock(OrderEntity order) {
        if (order.getOrderedItems() == null) return;

        for (var item : order.getOrderedItems()) {
            // Release reserved quantity back
            try {
                foodService.releaseReservedStock(item.getFoodId(), item.getQuantity() != null ? item.getQuantity() : 0);
            } catch (Exception e) {
                // In production: log warning and maybe retry — don't fail restore for other items.
                // For now, rethrow to surface error. Alternatively, swallow and continue.
                throw new RuntimeException("Failed to restore stock for item: " + item.getFoodId(), e);
            }
        }
    }


}
