package com.nisanth.foodapi.io.analytics;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class TopSellingDTO {
    private IdInfo _id;
    private Integer totalQty;

    @Data
    @NoArgsConstructor
    public static class IdInfo {
        private String id;
        private String name;
        private String imageUrl;
    }
}
