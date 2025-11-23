package com.nisanth.foodapi.util;

import com.amazonaws.SdkClientException;
import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.sns.AmazonSNS;
import com.amazonaws.services.sns.AmazonSNSClientBuilder;
import com.amazonaws.services.sns.model.PublishRequest;
import com.amazonaws.services.sns.model.PublishResult;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class MessageUtil {

    @Value("${myaws.access}")
    private String accessKeyId;

    @Value("${myaws.secret}")
    private String secretAccessKey;

    public void sendMessage(String phoneNumber, String message) {
        try {
            BasicAWSCredentials credentials =
                    new BasicAWSCredentials(accessKeyId, secretAccessKey);

            AmazonSNS snsClient = AmazonSNSClientBuilder.standard()
                    .withCredentials(new AWSStaticCredentialsProvider(credentials))
                    .withRegion(Regions.AP_SOUTHEAST_2)  // IMPORTANT: Use India region
                    .build();

            PublishResult result = snsClient.publish(
                    new PublishRequest()
                            .withMessage(message)
                            .withPhoneNumber(phoneNumber));

            System.out.println("Message sent! ID: " + result.getMessageId());

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
