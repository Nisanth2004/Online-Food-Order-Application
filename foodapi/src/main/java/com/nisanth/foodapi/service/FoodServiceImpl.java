package com.nisanth.foodapi.service;

import com.nisanth.foodapi.entity.FoodEntity;
import com.nisanth.foodapi.entity.ReviewEntity;
import com.nisanth.foodapi.io.FoodRequest;
import com.nisanth.foodapi.io.FoodResponse;
import com.nisanth.foodapi.repository.FoodRepository;
import com.nisanth.foodapi.repository.ReviewRepository;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectResponse;

import java.io.IOException;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class FoodServiceImpl implements FoodService{

    @Autowired
    private  S3Client s3Client;

    @Autowired
    private  FoodRepository foodRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Value("${aws.s3.bucketname}")
    private String bucketName;

    @Override
    public String uploadFile(MultipartFile file) {

       String fileNameExtension= file.getOriginalFilename().
               substring(file.getOriginalFilename().lastIndexOf(".")+1);

       // generate the unique id for the string
       String key=UUID.randomUUID().toString()+"."+fileNameExtension;
       try {
           PutObjectRequest putObjectRequest= PutObjectRequest.builder()
                   .bucket(bucketName)
                   .key(key)
                   .acl("public-read")
                   .contentType(file.getContentType())
                   .build();

           // store in bucket
           PutObjectResponse response= s3Client.putObject(putObjectRequest, RequestBody.fromBytes(file.getBytes()));

           if(response.sdkHttpResponse().isSuccessful())
           {
               return "https://"+bucketName+".s3.amazonaws.com/"+key;

           }
           else {
               throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,"File Upload failed");
           }
       }

       catch(IOException e)
       {
           throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,"An error Occured while uplaodung the file");
       }
    }

    @Override
    public FoodResponse addFood(FoodRequest request, MultipartFile file) {

        // convert to entity
      FoodEntity newFoodEntity= convertToEntity(request);
      String imageUrl=uploadFile(file);
      newFoodEntity.setImageUrl(imageUrl);
      newFoodEntity=foodRepository.save(newFoodEntity);

      // convert to response
     return convertToResponse(newFoodEntity);
    }

    // Get all foods (Sponsored -> Featured -> Normal)
    public List<FoodResponse> readFoods() {
        return foodRepository.findAllByOrderBySponsoredDescFeaturedDesc()
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // Get single food by ID
    public FoodResponse readFood(String id) {
        FoodEntity food = foodRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Food not found with id: " + id));
        return convertToResponse(food);
    }

    @Override
    public boolean deleteFile(String filename) {

        // delete the image in S3 bucket also

        DeleteObjectRequest deleteObjectRequest=DeleteObjectRequest.builder()
                .bucket(bucketName)
                .key(filename)
                .build();

        s3Client.deleteObject(deleteObjectRequest);
        return true;

    }

    @Override
    public void deleteFood(String id) {
        FoodResponse response=readFood(id);
        String imageUrl=response.getImageUrl();
        String filename=imageUrl.substring(imageUrl.lastIndexOf("/")+1);
       boolean isFileDeelted= deleteFile(filename);

       if(isFileDeelted) {
           foodRepository.deleteById(response.getId());
       }

    }
    public List<String> getCategories() {
        return foodRepository.findAll().stream()
                .map(FoodEntity::getCategory)
                .filter(cat -> cat != null && !cat.isBlank())
                .map(String::trim)
                .map(String::toLowerCase) // normalize case
                .distinct()
                .collect(Collectors.toList());
    }



    // convert to entity
    private FoodEntity convertToEntity(FoodRequest request)
    {
        return FoodEntity.builder()
                .name(request.getName())
                .price(request.getPrice())
                .description(request.getDescription())
                .category(request.getCategory())
                .sponsored(request.isSponsored()).featured(request.isFeatured()).build();
    }


    // convert to resposne object
    public FoodResponse convertToResponse(FoodEntity food) {
        FoodResponse res = new FoodResponse();
        res.setId(food.getId());
        res.setName(food.getName());
        res.setDescription(food.getDescription());
        res.setImageUrl(food.getImageUrl());
        res.setPrice(food.getPrice());
        res.setSponsored(food.isSponsored());
        res.setFeatured(food.isFeatured());

        List<ReviewEntity> reviews = reviewRepository.findByFoodId(food.getId());
        if (!reviews.isEmpty()) {
            double avg = reviews.stream()
                    .mapToInt(ReviewEntity::getRating)
                    .average()
                    .orElse(0.0);
            res.setAverageRating(avg);
            res.setReviewCount(reviews.size());
        } else {
            res.setAverageRating(0.0);
            res.setReviewCount(0);
        }

        return res;
    }

}
