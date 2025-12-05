package com.nisanth.foodapi.service;

import com.nisanth.foodapi.entity.Setting;
import com.nisanth.foodapi.repository.SettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SettingService {

    private final SettingRepository repo;

    public Setting getSettings() {
        return repo.findAll().stream().findFirst().orElse(null);
    }

    public Setting updateSettings(Setting settings) {
        settings.setUpdatedAt(System.currentTimeMillis());
        return repo.save(settings);
    }
}
