package com.nisanth.foodapi.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Document(collection = "stock_logs")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class StockLogEntity {

    @Id
    private String id;

    private String foodId;
    private String foodName;

    private int oldStock;
    private int newStock;
    private int change;  // newStock - oldStock

    private String updatedBy; // system / admin / user
    private String reason;    // order_reservation, cancel_restore, manual_update...

    private Date timestamp;
}
