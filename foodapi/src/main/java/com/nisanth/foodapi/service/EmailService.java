package com.nisanth.foodapi.service;

public interface EmailService {
    void sendOrderEmail(String to, String subject, String body);
}
