package com.nisanth.foodapi.controller;


import com.nisanth.foodapi.io.CartRequest;
import com.nisanth.foodapi.io.CartResponse;
import com.nisanth.foodapi.service.CartService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@AllArgsConstructor
public class CartController {

    private final CartService cartService;

    @PostMapping
    public CartResponse addToCart(@RequestBody CartRequest request)
    {

       String foodId= request.getFoodId();
        if(foodId== null || foodId.isEmpty())
        {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"FoodId not found");

        }
        return cartService.addToCart(request);



    }
}
