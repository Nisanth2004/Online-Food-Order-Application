package com.nisanth.foodapi.config;

import com.nisanth.foodapi.entity.Setting;
import com.nisanth.foodapi.service.SettingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

@Configuration
public class AwsConfig {

    @Autowired
    private SettingService settingService;

    @Bean
    public S3Client s3Client() {

        Setting s = settingService.getSettings();

        AwsBasicCredentials awsCreds = AwsBasicCredentials.create(
                s.getAwsAccess(),
                s.getAwsSecret()
        );

        return S3Client.builder()
                .region(Region.of(s.getAwsRegion()))
                .credentialsProvider(StaticCredentialsProvider.create(awsCreds))
                .build();
    }
}

