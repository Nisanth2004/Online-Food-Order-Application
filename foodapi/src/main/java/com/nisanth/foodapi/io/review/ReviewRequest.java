package com.nisanth.foodapi.io.review;

import lombok.Data;

@Data
public class ReviewRequest {
    private String user;
    private int rating;
    private String comment;
}