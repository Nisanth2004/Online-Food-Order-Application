package com.nisanth.foodapi.enumeration;

public enum OrderStatus {
    ORDER_PLACED,          // Customer placed the order
    ORDER_CONFIRMED,       // Seller accepted
    ORDER_PACKED,          // Seller packed items
    SHIPPED,               // Courier picked up
    ORDER_AT_HUB,          // ⭐ Arrived at nearest hub (NEW)
    OUT_FOR_DELIVERY,      // Delivery partner delivering
    DELIVERED,             // Customer received
    CANCELLED,
    CANCEL_REQUESTED;

    public static OrderStatus fromString(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Order status cannot be null or empty");
        }
        try {
            return OrderStatus.valueOf(value.trim().toUpperCase());
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid order status: " + value);
        }
    }
}
