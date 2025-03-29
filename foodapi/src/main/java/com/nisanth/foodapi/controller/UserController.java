package com.nisanth.foodapi.controller;

import com.nisanth.foodapi.io.UserRequest;
import com.nisanth.foodapi.io.UserResponse;
import com.nisanth.foodapi.service.UserService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@AllArgsConstructor
@RequestMapping("/api")
public class UserController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse register(@RequestBody UserRequest request)
    {
        return  userService.registerUser(request);


    }
}
