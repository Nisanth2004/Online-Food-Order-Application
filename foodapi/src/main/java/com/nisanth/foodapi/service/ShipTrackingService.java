package com.nisanth.foodapi.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
public class ShipTrackingService {

    private final RestTemplate rest = new RestTemplate();
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${shiptracker.api-key}") private String apiKey;
    @Value("${shiptracker.base-url:https://track.shiptracker.in/api/track}") private String baseUrl;

    public JsonNode registerTracking(String courierName, String trackingId) throws Exception {
        String url = baseUrl + "/register";
        HttpHeaders headers = new HttpHeaders();
        headers.set("x-api-key", apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        String body = String.format("""
            {"courier":"%s","trackingId":"%s"}
        """, courierName, trackingId);

        HttpEntity<String> req = new HttpEntity<>(body, headers);
        ResponseEntity<String> res = rest.exchange(url, HttpMethod.POST, req, String.class);
        return mapper.readTree(res.getBody());
    }

    public JsonNode fetchTracking(String trackingId) throws Exception {
        String url = baseUrl + "/status/" + trackingId;
        HttpHeaders headers = new HttpHeaders();
        headers.set("x-api-key", apiKey);

        ResponseEntity<String> res = rest.exchange(url, HttpMethod.GET, new HttpEntity<>(headers), String.class);
        return mapper.readTree(res.getBody());
    }
}
