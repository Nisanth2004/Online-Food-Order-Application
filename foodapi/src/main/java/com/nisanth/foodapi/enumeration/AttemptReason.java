package com.nisanth.foodapi.enumeration;

public enum AttemptReason {
    CUSTOMER_NOT_AVAILABLE,
    ADDRESS_NOT_FOUND,
    PAYMENT_FAILED,
    CONTACT_NUMBER_INVALID,
    OTHER;

    public static AttemptReason fromString(String value) {
        if (value == null || value.isBlank()) return OTHER;
        try {
            return AttemptReason.valueOf(value.trim().toUpperCase());
        } catch (Exception e) {
            return OTHER;
        }
    }
}
