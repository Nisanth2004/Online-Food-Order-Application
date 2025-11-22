package com.nisanth.foodapi.service;

import com.nisanth.foodapi.entity.StockLogEntity;
import com.nisanth.foodapi.repository.AnalyticsRepository;
import com.nisanth.foodapi.repository.StockLogRepository;
import com.nisanth.foodapi.repository.FoodRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final StockLogRepository stockLogRepository;
    private final AnalyticsRepository analyticsRepository;
    private final FoodRepository foodRepository;

    public List<StockLogEntity> getAllStockLogs() {
        return stockLogRepository.findAllByOrderByTimestampDesc();
    }

    // ------------------------------
    // MONTHLY SALES
    // ------------------------------
    public List<Map<String, Object>> getMonthlySales() {
        List<Map<String, Object>> list = analyticsRepository.getMonthlySales();

        list.forEach(item -> {
            if (item.get("total") == null) item.put("total", 0);
            if (item.get("month") == null) item.put("month", 0);
        });

        return list;
    }

    // ------------------------------
    // MONTHLY STOCK HISTORY
    // ------------------------------
    public List<Map<String, Object>> getMonthlyStockHistory() {
        List<Map<String, Object>> list = analyticsRepository.getMonthlyStockHistory();

        list.forEach(item -> {
            if (item.get("units") == null) item.put("units", 0);
            if (item.get("month") == null) item.put("month", 0);
        });

        return list;
    }

    public List<Map<String, Object>> getTopSellingFoods() {
        return foodRepository.getTopSellingFoods();
    }

    public List<Map<String, Object>> getLowStockItems() {
        return foodRepository.getLowStockItems();
    }
}
