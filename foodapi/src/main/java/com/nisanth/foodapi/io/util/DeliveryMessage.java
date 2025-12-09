package com.nisanth.foodapi.io.util;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DeliveryMessage {

    private String message;
    private LocalDateTime timestamp;
    private String actor; // delivery-boy / hub / admin
    private String reason; // optional


}
