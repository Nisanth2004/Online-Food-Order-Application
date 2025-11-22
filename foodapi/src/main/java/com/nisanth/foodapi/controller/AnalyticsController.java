package com.nisanth.foodapi.controller;

import com.nisanth.foodapi.entity.StockLogEntity;
import com.nisanth.foodapi.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/stock/logs")
    public List<StockLogEntity> getStockLogs() {
        return analyticsService.getAllStockLogs();
    }

    @GetMapping("/sales/monthly")
    public List<Map<String, Object>> getMonthlySales() {
        return analyticsService.getMonthlySales();
    }

    @GetMapping("/stock/history/monthly")
    public List<Map<String, Object>> getMonthlyStockHistory() {
        return analyticsService.getMonthlyStockHistory();
    }

    @GetMapping("/top-selling")
    public List<Map<String, Object>> getTopFoods() {
        return analyticsService.getTopSellingFoods();
    }

    @GetMapping("/low-stock")
    public List<Map<String, Object>> getLowStockFoods() {
        return analyticsService.getLowStockItems();
    }
}
