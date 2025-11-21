package com.nisanth.foodapi.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import software.amazon.awssdk.services.s3.S3Client;

@RestController
@RequiredArgsConstructor
public class TestController {
    @Autowired
    private S3Client s3Client;

    @GetMapping("/test-s3")
    public String testS3() {
        return s3Client.listBuckets().buckets().toString();
    }

}
