package com.nisanth.foodapi.repository.offers;

import com.nisanth.foodapi.entity.FlashSaleEntity;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.List;

public interface FlashSaleRepository
        extends MongoRepository<FlashSaleEntity, String> {

    Optional<FlashSaleEntity>
    findByFoodIdAndActiveTrueAndStartTimeBeforeAndEndTimeAfter(
            String foodId,
            LocalDateTime start,
            LocalDateTime end
    );

    List<FlashSaleEntity>
    findByActiveTrueAndStartTimeBeforeAndEndTimeAfter(
            LocalDateTime start,
            LocalDateTime end
    );
}
