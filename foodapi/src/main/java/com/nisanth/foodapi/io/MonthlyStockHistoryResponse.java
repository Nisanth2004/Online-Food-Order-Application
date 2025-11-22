package com.nisanth.foodapi.io;

import lombok.Data;

@Data
public class MonthlyStockHistoryResponse {
    private int month;
    private int year;
    private int units;
}
