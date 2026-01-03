package com.nisanth.foodapi.service.impl;

import com.nisanth.foodapi.service.EmailService;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    public void sendOrderEmail(String to, String subject, String htmlContent) {

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject(subject);

            // IMPORTANT: true = enable HTML
            helper.setText(htmlContent, true);

            mailSender.send(message);

        } catch (Exception e) {
            throw new RuntimeException("Failed to send email", e);
        }
    }
}
