package com.nisanth.foodapi.io;

import lombok.Data;

@Data
public class MonthlySalesResponse {
    private int month;
    private int year;
    private double total;
}