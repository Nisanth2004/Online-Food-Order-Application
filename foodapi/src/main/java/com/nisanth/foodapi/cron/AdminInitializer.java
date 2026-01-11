package com.nisanth.foodapi.cron;

import com.nisanth.foodapi.entity.AccountEntity;
import com.nisanth.foodapi.enumeration.AccountRole;
import com.nisanth.foodapi.enumeration.AccountStatus;
import com.nisanth.foodapi.repository.AccountRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AdminInitializer {

    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;

    @PostConstruct
    public void initAdmin() {
        if (accountRepository.findByEmail("admin@gmail.com").isEmpty()) {
            accountRepository.save(
                AccountEntity.builder()
                    .email("admin@gmail.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role(AccountRole.ADMIN)
                    .status(AccountStatus.ACTIVE)
                    .build()
            );
        }
    }
}
