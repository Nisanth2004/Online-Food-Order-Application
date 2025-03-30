package com.nisanth.foodapi.service;

import com.nisanth.foodapi.entity.CartEntity;
import com.nisanth.foodapi.io.CartRequest;
import com.nisanth.foodapi.io.CartResponse;
import com.nisanth.foodapi.repository.CartRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
@AllArgsConstructor
public class CartServiceImpl implements CartService{

   private final CartRepository cartRepository;
   private final UserService userService;

    @Override
    public CartResponse addToCart(CartRequest request) {
        String loggedInUserId=userService.findByUserId();

        // check existing cart is available for the user
       Optional<CartEntity> cartOptional= cartRepository.findByUserId(loggedInUserId);
      CartEntity cart= cartOptional.orElseGet(()->new CartEntity(loggedInUserId,new HashMap<>()));

      // get the items from cart
      Map<String,Integer> cartItems= cart.getItems();
      cartItems.put(request.getFoodId(), cartItems.getOrDefault(request.getFoodId(),0)+ 1);
      cart.setItems(cartItems);
      cart= cartRepository.save(cart);
     return convertToResponse(cart);
    }


    private CartResponse convertToResponse(CartEntity cartEntity)
    {
       return CartResponse.builder()
                .id(cartEntity.getId())
                .userId(cartEntity.getUserId())
                .items(cartEntity.getItems())
                .build();

    }
}
