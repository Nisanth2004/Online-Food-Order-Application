package com.nisanth.foodapi.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document("hub_staff")
public class HubStaff {

    @Id
    private String id;

    private String hubName;   // Coimbatore, Trichy, Chennai...
    private String staffName;
    private String pin;       // 4-digit LOGIN PIN
}
