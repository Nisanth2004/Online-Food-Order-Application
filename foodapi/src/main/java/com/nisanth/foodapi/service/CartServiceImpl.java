package com.nisanth.foodapi.service;

import com.nisanth.foodapi.entity.CartEntity;
import com.nisanth.foodapi.io.cart.CartRequest;
import com.nisanth.foodapi.io.cart.CartResponse;
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

    @Override
    public CartResponse getCart() {
        String loggedInUserId=userService.findByUserId();
       CartEntity entity= cartRepository.findByUserId(loggedInUserId)
                .orElse(new CartEntity(null,loggedInUserId,new HashMap<>()));
      return  convertToResponse(entity);

    }

    @Override
    public void clearCart() {
        String loggedInUserId=userService.findByUserId();
        cartRepository.deleteByUserId(loggedInUserId);
    }

    @Override
    public CartResponse removeFromCart(CartRequest cartRequest) {

        // get user id
        String loggedInUserId=userService.findByUserId();
       CartEntity entity= cartRepository.findByUserId(loggedInUserId).orElseThrow(()->new RuntimeException("Cart is not found"));


       // get the items from cart
      Map<String,Integer> cartItems= entity.getItems();

      // if its present
      if(cartItems.containsKey(cartRequest.getFoodId()))
      {
         int currentQty= cartItems.get(cartRequest.getFoodId());
         if(currentQty>0)
         {
             cartItems.put(cartRequest.getFoodId(), currentQty-1);
         }
         else {
             cartItems.remove(cartRequest.getFoodId());
         }
        entity= cartRepository.save(entity);

      }

return   convertToResponse(entity);

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
