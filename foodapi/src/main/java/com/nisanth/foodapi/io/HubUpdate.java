package com.nisanth.foodapi.io;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class HubUpdate {
    private String hubName;       // Coimbatore, Trichy, Chennai
    private String staffName;     // The person who updated
    private String message;       // “Order reached Trichy hub”
    private LocalDateTime time;
}
