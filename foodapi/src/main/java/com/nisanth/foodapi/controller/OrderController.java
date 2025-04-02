package com.nisanth.foodapi.controller;

import com.nisanth.foodapi.io.OrderRequest;
import com.nisanth.foodapi.io.OrderResponse;
import com.nisanth.foodapi.service.OrderService;
import com.razorpay.RazorpayException;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@AllArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/create")
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponse createOrderWithPayment(@RequestBody OrderRequest request) throws RazorpayException {
        OrderResponse response=orderService.createOrderWithPayment(request);
        return response;
    }


    // verify the payment
    @PostMapping("/verify")
    public void verifyPayment(@RequestBody Map<String,String> paymentData)
    {
        orderService.verifyPayment(paymentData,"Paid");
    }


    // get all the orders
    @GetMapping
    public List<OrderResponse> getAllOrders()
    {

       return orderService.getUserOrders();
    }

    // delete the order for particular user
    @DeleteMapping("/{orderId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteOrder(@PathVariable String orderId)
    {
        orderService.removeOrder(orderId);
    }

    // admin panel - get all orders for all users
    @GetMapping("/all")
    public List<OrderResponse> getOrdersOfAllUsers()
    {
        return orderService.getOrdersOfAllUsers();

    }


    // update the order status - admin panel
    @PatchMapping("/status/{orderId}")
    public void updateOrderStatus(@PathVariable String orderId,@RequestParam String status)
    {
       orderService.updateOrderStatus(orderId, status);
    }
}
