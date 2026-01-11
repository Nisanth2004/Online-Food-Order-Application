package com.nisanth.foodapi.service.security;

import com.nisanth.foodapi.entity.AccountEntity;
import com.nisanth.foodapi.entity.UserEntity;
import com.nisanth.foodapi.repository.AccountRepository;
import com.nisanth.foodapi.repository.UserRepsitory;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UnifiedUserDetailsService implements UserDetailsService {

    private final AccountRepository accountRepository;
    private final UserRepsitory userRepository;

    @Override
    public UserDetails loadUserByUsername(String email)
            throws UsernameNotFoundException {

        // 1️⃣ Check Admin / Vendor (Account)
        AccountEntity account = accountRepository.findByEmail(email).orElse(null);

        if (account != null) {
            return User.builder()
                    .username(account.getEmail())
                    .password(account.getPassword())
                    .authorities(
                            List.of(new SimpleGrantedAuthority(
                                    "ROLE_" + account.getRole().name()))
                    )
                    .build();
        }

        // 2️⃣ Check Customer (User)
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UsernameNotFoundException("User not found"));

        return User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_USER")))
                .build();
    }
}
