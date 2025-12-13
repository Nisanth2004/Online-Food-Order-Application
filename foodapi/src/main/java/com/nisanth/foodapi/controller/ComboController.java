package com.nisanth.foodapi.controller;

import com.nisanth.foodapi.entity.ComboEntity;
import com.nisanth.foodapi.entity.FoodEntity;
import com.nisanth.foodapi.repository.FoodRepository;
import com.nisanth.foodapi.repository.offers.ComboRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/combos")
public class ComboController {

    @Autowired
    private ComboRepository comboRepository;

    @GetMapping
    public List<ComboEntity> getAllCombos() {
        return comboRepository.findAll();
    }

    @GetMapping("/{id}")
    public ComboEntity getComboById(@PathVariable String id) {
        return comboRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Combo not found"));
    }

    @PostMapping
    public ComboEntity createCombo(@RequestBody ComboEntity combo) {
        return comboRepository.save(combo);
    }

    @PutMapping("/{id}")
    public ComboEntity updateCombo(
            @PathVariable String id,
            @RequestBody ComboEntity combo) {

        combo.setId(id);
        return comboRepository.save(combo);
    }

    @DeleteMapping("/{id}")
    public void deleteCombo(@PathVariable String id) {
        comboRepository.deleteById(id);
    }

    // ACTIVE combos (already working)
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
                    return res;
                })
                .toList();
    }
}
