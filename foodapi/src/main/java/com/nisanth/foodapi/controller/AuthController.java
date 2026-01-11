package com.nisanth.foodapi.controller;

import com.nisanth.foodapi.io.auth.AuthenticationRequest;
import com.nisanth.foodapi.io.auth.AuthenticationResponse;
import com.nisanth.foodapi.service.security.UnifiedUserDetailsService;
import com.nisanth.foodapi.util.JwtUtil;
import lombok.AllArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@AllArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UnifiedUserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;


    @PostMapping("/login")
    public AuthenticationResponse login(@RequestBody AuthenticationRequest request)
    {
        authenticationManager.authenticate( new UsernamePasswordAuthenticationToken(request.getEmail(),request.getPassword()));

        //generate the token
        final UserDetails userDetails=userDetailsService.loadUserByUsername(request.getEmail());
        final String jwtToken= jwtUtil.generateToken(userDetails);
        return new AuthenticationResponse(request.getEmail() ,jwtToken);
    }
}
