package com.nisanth.foodapi.repository;

import com.nisanth.foodapi.entity.HubStaff;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface HubStaffRepository extends MongoRepository<HubStaff, String> {
    Optional<HubStaff> findByHubNameAndPin(String hubName, String pin);
}
