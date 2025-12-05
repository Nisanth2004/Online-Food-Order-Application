package com.nisanth.foodapi.service;

import com.nisanth.foodapi.entity.Setting;
import com.nisanth.foodapi.service.SettingService;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SmsService {

    @Autowired
    private SettingService settingService;

    public void sendSms(String to, String text) {
        try {
            Setting s = settingService.getSettings();

            Message.creator(
                    new PhoneNumber(to.trim()),        // recipient
                    new PhoneNumber(s.getTwilioPhone().trim()), // Twilio number
                    text
            ).create();

            System.out.println("✅ SMS sent to " + to);

        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("❌ Failed to send SMS: " + e.getMessage());
        }
    }
}
