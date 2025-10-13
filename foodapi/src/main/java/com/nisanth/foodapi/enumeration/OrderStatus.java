package com.nisanth.foodapi.enumeration;

public enum OrderStatus {
    PENDING("Pending"),
    CONFIRMED("Confirmed"),
    PREPARING("In Kitchen"),
    OUT_FOR_DELIVERY("Out For Delivery"),
    DELIVERED("Delivered"),
    CANCELLED("Cancelled"),
    CANCEL_REQUESTED("Cancel Requested");

    private final String displayName;

    OrderStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    // Optional: map from DB string to enum
    public static OrderStatus fromString(String status) {
        for (OrderStatus os : OrderStatus.values()) {
            if (os.displayName.equalsIgnoreCase(status) ||
                    os.name().equalsIgnoreCase(status.replace(" ", "_"))) {
                return os;
            }
        }
        throw new IllegalArgumentException("Unknown order status: " + status);
    }
}

