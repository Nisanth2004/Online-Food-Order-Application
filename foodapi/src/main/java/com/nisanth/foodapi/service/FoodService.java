package com.nisanth.foodapi.service;

import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.services.s3.endpoints.internal.Value;

public interface FoodService {

 String uploadFile(MultipartFile file);
}
