package com.nisanth.foodapi.service;

import com.nisanth.foodapi.entity.Setting;
import com.nisanth.foodapi.repository.SettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SettingService {

    private final SettingRepository repo;

    public Setting getSettings() {
        return repo.findAll().stream().findFirst().orElse(null);
    }

    public Setting updateSettings(Setting settings) {

        // Validate AWS
        if (settings.getAwsAccess() == null || settings.getAwsAccess().isBlank()) {
            throw new IllegalArgumentException("AWS Access Key is missing");
        }
        if (settings.getAwsSecret() == null || settings.getAwsSecret().isBlank()) {
            throw new IllegalArgumentException("AWS Secret Key is missing");
        }

        // Validate Razorpay
        if (settings.getRazorpayKey() == null || settings.getRazorpayKey().isBlank()) {
            throw new IllegalArgumentException("Razorpay Key is missing");
        }
        if (settings.getRazorpaySecret() == null || settings.getRazorpaySecret().isBlank()) {
            throw new IllegalArgumentException("Razorpay Secret is missing");
        }

        // Validate Twilio
        if (settings.getTwilioSid() == null || settings.getTwilioSid().isBlank()) {
            throw new IllegalArgumentException("Twilio SID is missing");
        }
        if (settings.getTwilioAuth() == null || settings.getTwilioAuth().isBlank()) {
            throw new IllegalArgumentException("Twilio Auth Token is missing");
        }
        if (settings.getTwilioPhone() == null || settings.getTwilioPhone().isBlank()) {
            throw new IllegalArgumentException("Twilio phone number is missing");
        }

        if (settings.getTaxPercentage() == null) {
            settings.setTaxPercentage(5.0);
        }
        if (settings.getShippingCharge() == null) {
            settings.setShippingCharge(10.0);
        }


        settings.setUpdatedAt(System.currentTimeMillis());
        return repo.save(settings);
    }
}

