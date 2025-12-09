package com.nisanth.foodapi.controller;

import com.nisanth.foodapi.entity.StockLogEntity;
import com.nisanth.foodapi.io.analytics.LowStockDTO;
import com.nisanth.foodapi.io.analytics.MonthlySalesDTO;
import com.nisanth.foodapi.io.analytics.StockHistoryDTO;
import com.nisanth.foodapi.io.analytics.TopSellingDTO;
import com.nisanth.foodapi.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    public List<MonthlySalesDTO> getMonthlySales() {
        return analyticsService.getMonthlySales();
    }

    @GetMapping("/stock/history/monthly")
    public List<StockHistoryDTO> getMonthlyStockHistory() {
        return analyticsService.getMonthlyStockHistory();
    }

    @GetMapping("/top-selling")
    public List<TopSellingDTO> getTopFoods() {
        return analyticsService.getTopSellingFoods();
    }

    @GetMapping("/low-stock")
    public List<LowStockDTO> getLowStockItems() {
        return analyticsService.getLowStockItems();
    }
}
