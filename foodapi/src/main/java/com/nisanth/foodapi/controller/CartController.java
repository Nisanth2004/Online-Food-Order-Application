package com.nisanth.foodapi.controller;


import com.nisanth.foodapi.io.CartRequest;
import com.nisanth.foodapi.io.CartResponse;
import com.nisanth.foodapi.service.CartService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
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


    // get the cart for user
    @GetMapping
    public CartResponse getCart()
    {
        return cartService.getCart();
    }

    // clear the cart
    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void clearCart()
    {
         cartService.clearCart();
    }


    // remove the food from cart
    @PostMapping("/remove")
    public CartResponse removeFromCart(@RequestBody CartRequest request)
    {
        String foodId= request.getFoodId();
        if(foodId== null || foodId.isEmpty())
        {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"FoodId not found");

        }
       return cartService.removeFromCart(request);

    }

}
