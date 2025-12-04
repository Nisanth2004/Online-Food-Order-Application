package com.nisanth.foodapi.service;

import com.nisanth.foodapi.entity.StockLogEntity;
import com.nisanth.foodapi.io.LowStockDTO;
import com.nisanth.foodapi.io.MonthlySalesDTO;
import com.nisanth.foodapi.io.StockHistoryDTO;
import com.nisanth.foodapi.io.TopSellingDTO;
import com.nisanth.foodapi.repository.AnalyticsRepository;
import com.nisanth.foodapi.repository.OrderRepository;
import com.nisanth.foodapi.repository.StockLogRepository;
import com.nisanth.foodapi.repository.FoodRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final StockLogRepository stockLogRepository;
    private final AnalyticsRepository analyticsRepository;
    private final FoodRepository foodRepository;
    private final OrderRepository orderRepository;

    public List<StockLogEntity> getAllStockLogs() {
        return stockLogRepository.findAllByOrderByTimestampDesc();
    }

    // ------------------------------
    // MONTHLY SALES
    // ------------------------------
    public List<MonthlySalesDTO> getMonthlySales() {
        return analyticsRepository.getMonthlySales();
    }

    // ------------------------------
    // MONTHLY STOCK HISTORY
    // ------------------------------
    public List<StockHistoryDTO> getMonthlyStockHistory() {
        return stockLogRepository.getMonthlyStockHistory();
    }

    // ------------------------------
    // TOP SELLING ITEMS
    // ------------------------------
    public List<TopSellingDTO> getTopSellingFoods() {
        return orderRepository.getTopSellingFoods();
    }

    // ------------------------------
    // LOW STOCK ITEMS
    // ------------------------------
    public List<LowStockDTO> getLowStockItems() {
        return foodRepository.getLowStockItems();
    }
}
