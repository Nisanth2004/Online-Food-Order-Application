package com.nisanth.foodapi.config;

import com.nisanth.foodapi.entity.Setting;
import com.nisanth.foodapi.service.SettingService;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import com.twilio.Twilio;

@Configuration
public class TwilioConfig {

    @Autowired
    private SettingService settingService;

    @PostConstruct
    public void initTwilio() {
        Setting s = settingService.getSettings();
        Twilio.init(s.getTwilioSid().trim(), s.getTwilioAuth().trim());
        System.out.println("Twilio initialized");
        System.out.println("SID: " + s.getTwilioSid());
        System.out.println("From: " + s.getTwilioPhone());
    }
}
