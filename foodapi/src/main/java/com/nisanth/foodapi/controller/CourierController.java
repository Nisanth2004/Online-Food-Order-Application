package com.nisanth.foodapi.controller;

import com.nisanth.foodapi.entity.Courier;
import com.nisanth.foodapi.repository.CourierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/couriers")
@RequiredArgsConstructor
public class CourierController {

    private final CourierRepository courierRepository;

    @GetMapping
    public List<Courier> getAllCouriers() {
        return courierRepository.findAll();
    }

    @PostMapping
    public Courier addCourier(@RequestBody Courier courier) {
        return courierRepository.save(courier);
    }

    @PutMapping("/{id}")
    public Courier updateCourier(@PathVariable String id, @RequestBody Courier courier) {
        courier.setId(id);
        return courierRepository.save(courier);
    }

    @DeleteMapping("/{id}")
    public void deleteCourier(@PathVariable String id) {
        courierRepository.deleteById(id);
    }
}
