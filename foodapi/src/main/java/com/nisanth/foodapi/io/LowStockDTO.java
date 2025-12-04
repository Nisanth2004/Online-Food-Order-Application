package com.nisanth.foodapi.io;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LowStockDTO {
    private String id;
    private String name;
    private Integer stock;
    private String imageUrl;
}
