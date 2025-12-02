package com.nisanth.foodapi.service;

import com.nisanth.foodapi.entity.Courier;
import com.nisanth.foodapi.repository.CourierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CourierService {

    @Autowired
    private CourierRepository courierRepository;

    public void updateDefaultCourierById(String id) {

        // remove old default
        courierRepository.findByIsDefaultTrue().ifPresent(c -> {
            c.setIsDefault(false);
            courierRepository.save(c);
        });

        // set new default using ID
        Courier newDefault = courierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Courier not found"));

        newDefault.setIsDefault(true);
        courierRepository.save(newDefault);
    }


    public void removeDefaultCourier() {
        courierRepository.findByIsDefaultTrue().ifPresent(c -> {
            c.setIsDefault(false);
            courierRepository.save(c);
        });
    }

}
