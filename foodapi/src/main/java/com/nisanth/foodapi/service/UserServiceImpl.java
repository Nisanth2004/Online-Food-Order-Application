package com.nisanth.foodapi.service;

import com.nisanth.foodapi.entity.UserEntity;
import com.nisanth.foodapi.io.UserRequest;
import com.nisanth.foodapi.io.UserResponse;
import com.nisanth.foodapi.repository.UserRepsitory;
import lombok.AllArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


@Service
@AllArgsConstructor
public class UserServiceImpl implements UserService{


   private final UserRepsitory userRepsitory;
    private final PasswordEncoder passwordEncoder;
    @Override
    public UserResponse registerUser(UserRequest userRequest) {

      UserEntity newUser=  convertToEntity(userRequest);
      newUser=userRepsitory.save(newUser);
    return  convertToResponse(newUser);


    }



    // convert to entity
    private UserEntity convertToEntity(UserRequest request)
    {
       return UserEntity.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .build();
    }


    // convert to response
    private UserResponse convertToResponse(UserEntity registeredUser)
    {
       return  UserResponse.builder()
                 .id(registeredUser.getId())
                 .name(registeredUser.getName())
                 .email(registeredUser.getEmail())
                 .build();
    }
}
