package com.nisanth.foodapi.io;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FoodRequest {

    private String name;
    private String description;
    private double price;
    private List<String> categoryIds;
    private boolean sponsored;
    private boolean featured;
}
