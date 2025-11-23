package com.nisanth.foodapi.service;

import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class SmsService {

    private final String API_URL = "https://api.webexinteract.com/v1/sms/";
    private final String ACCESS_TOKEN = "aky_35rSw7GHVaqkP6o2xKwmpU6wpmU";  // your key

    public String sendSms(String phone, String message) {

        try {
            RestTemplate restTemplate = new RestTemplate();

            HttpHeaders headers = new HttpHeaders();
            headers.set("X-AUTH-KEY", ACCESS_TOKEN);
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> msg = new HashMap<>();
            msg.put("to", "+" + phone);     // +919876543210
            msg.put("from", "SENDERID");    // MUST be registered
            msg.put("body", message);

            Map<String, Object> body = new HashMap<>();
            body.put("messages", List.of(msg));

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

            ResponseEntity<String> response =
                    restTemplate.postForEntity(API_URL, entity, String.class);

            return response.getBody();

        } catch (Exception e) {
            return "SMS Error: " + e.getMessage();
        }
    }
}
