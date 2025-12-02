package com.nisanth.foodapi.controller;

import com.nisanth.foodapi.entity.Courier;
import com.nisanth.foodapi.repository.CourierRepository;
import com.nisanth.foodapi.service.CourierService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/couriers")
@RequiredArgsConstructor
public class CourierController {

    private final CourierRepository courierRepository;
    private final CourierService courierService;

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

    @PutMapping("/default/{id}")
    public ResponseEntity<?> updateDefaultCourier(@PathVariable String id) {
        courierService.updateDefaultCourierById(id);
        return ResponseEntity.ok("Default courier updated");
    }

    @PutMapping("/default/remove")
    public ResponseEntity<?> removeDefault() {
        courierService.removeDefaultCourier();
        return ResponseEntity.ok("Default courier removed");
    }
}

