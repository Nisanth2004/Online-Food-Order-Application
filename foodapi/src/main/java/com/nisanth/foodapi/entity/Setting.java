package com.nisanth.foodapi.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "system_settings")
public class Setting {

    @Id
    private String id;

    private String awsAccess;
    private String awsSecret;
    private String awsRegion;
    private String awsBucket;

    private String razorpayKey;
    private String razorpaySecret;

    private String twilioSid;
    private String twilioAuth;
    private String twilioPhone;

    private String smtpHost;          // e.g. smtp.gmail.com
    private String smtpPort;          // 587 or 465
    private String emailUser;         // full email e.g. test@gmail.com
    private String emailPassword;     // app password
    private boolean smtpStartTls;     // true
    private boolean smtpAuth;         // true
    private boolean smtpSsl;

    private long updatedAt;

    private Double taxPercentage;   // example: 5.0
    private Double shippingCharge;  // example: 10.0

}
