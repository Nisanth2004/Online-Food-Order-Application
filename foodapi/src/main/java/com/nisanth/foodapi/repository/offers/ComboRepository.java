package com.nisanth.foodapi.repository.offers;

import com.nisanth.foodapi.entity.ComboEntity;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface ComboRepository extends MongoRepository<ComboEntity,String> {
    List<ComboEntity> findByActiveTrue();

    List<ComboEntity>
    findByActiveTrueAndStartTimeBeforeAndEndTimeAfter(
            LocalDateTime start,
            LocalDateTime end
    );
}
