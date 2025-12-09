package com.nisanth.foodapi.io.analytics;

import lombok.Data;

@Data
public class MonthlySalesResponse {
    private int month;
    private int year;
    private double total;
}