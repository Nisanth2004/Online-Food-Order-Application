package com.nisanth.foodapi.controller;

import com.nisanth.foodapi.entity.ComboEntity;
import com.nisanth.foodapi.entity.FoodEntity;
import com.nisanth.foodapi.repository.FoodRepository;
import com.nisanth.foodapi.repository.offers.ComboRepository;
import com.nisanth.foodapi.service.FoodService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/combos")
public class ComboController {

    @Autowired
    private ComboRepository comboRepository;

    @Autowired
    private FoodService fileUploadService;

    @Autowired
    private FoodRepository foodRepository;

    // ✅ GET ALL
    @GetMapping
    public List<ComboEntity> getAllCombos() {
        return comboRepository.findAll();
    }

    // ✅ GET BY ID
    @GetMapping("/{id}")
    public ComboEntity getComboById(@PathVariable String id) {
        return comboRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Combo not found"));
    }

    // ✅ CREATE WITH IMAGE
    @PostMapping(consumes = "multipart/form-data")
    public ComboEntity createCombo(
            @RequestPart("data") ComboEntity combo,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) {
        if (image != null && !image.isEmpty()) {
            String imageUrl = fileUploadService.uploadFile(image);
            combo.setImageUrl(imageUrl);
        }
        return comboRepository.save(combo);
    }

    // ✅ UPDATE WITH IMAGE
    @PutMapping(value = "/{id}", consumes = "multipart/form-data")
    public ComboEntity updateCombo(
            @PathVariable String id,
            @RequestPart("data") ComboEntity combo,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) {
        combo.setId(id);

        if (image != null && !image.isEmpty()) {
            String imageUrl = fileUploadService.uploadFile(image);
            combo.setImageUrl(imageUrl);
        }
        return comboRepository.save(combo);
    }

    // ✅ DELETE
    @DeleteMapping("/{id}")
    public void deleteCombo(@PathVariable String id) {
        comboRepository.deleteById(id);
    }

    // ✅ ACTIVE COMBOS (for slider)
    @GetMapping("/active")
    public List<Map<String, Object>> getActiveCombos() {
        LocalDateTime now = LocalDateTime.now();

        return comboRepository
                .findByActiveTrueAndStartTimeBeforeAndEndTimeAfter(now, now)
                .stream()
                .map(combo -> {
                    Map<String, Object> res = new HashMap<>();
                    res.put("id", combo.getId());
                    res.put("name", combo.getName());
                    res.put("comboPrice", combo.getComboPrice());
                    res.put("imageUrl", combo.getImageUrl());
                    return res;
                })
                .toList();
    }

    @GetMapping("/{id}/details")
    public Map<String, Object> getComboDetails(@PathVariable String id) {
        ComboEntity combo = comboRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Combo not found"));

        List<FoodEntity> foods = foodRepository.findAllById(combo.getFoodIds());

        Map<String, Object> res = new HashMap<>();
        res.put("id", combo.getId());
        res.put("name", combo.getName());
        res.put("imageUrl", combo.getImageUrl());
        res.put("originalPrice", combo.getOriginalPrice());
        res.put("comboPrice", combo.getComboPrice());
        res.put("foods", foods);

        return res;
    }

}
