package com.nisanth.foodapi.service.security;


import com.nisanth.foodapi.entity.AccountEntity;
import com.nisanth.foodapi.enumeration.AccountRole;
import com.nisanth.foodapi.io.admin.AccessRequest;
import com.nisanth.foodapi.io.admin.AccessResponse;
import com.nisanth.foodapi.repository.AccountRepository;
import com.nisanth.foodapi.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AccessService {

    private final AccountRepository accountRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    public AccessResponse grantAccess(AccessRequest request, AccountRole expectedRole) {

        AccountEntity account = accountRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (account.getRole() != expectedRole) {
            throw new RuntimeException("Access denied");
        }

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        String token = jwtUtil.generateToken(
                new org.springframework.security.core.userdetails.User(
                        account.getEmail(),
                        account.getPassword(),
                        List.of(() -> "ROLE_" + account.getRole().name())
                )
        );

        return new AccessResponse(
                token,
                account.getRole().name(),
                account.getStatus().name()
        );
    }
}
