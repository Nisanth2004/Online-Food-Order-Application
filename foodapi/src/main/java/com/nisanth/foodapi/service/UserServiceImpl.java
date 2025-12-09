package com.nisanth.foodapi.service;

import com.nisanth.foodapi.entity.UserEntity;
import com.nisanth.foodapi.io.user.UserRequest;
import com.nisanth.foodapi.io.user.UserResponse;
import com.nisanth.foodapi.repository.UserRepsitory;
import lombok.AllArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


@Service
@AllArgsConstructor
public class UserServiceImpl implements UserService{


   private final UserRepsitory userRepsitory;
    private final PasswordEncoder passwordEncoder;

    private final AuthenticationFacade authenticationFacade;
    @Override
    public UserResponse registerUser(UserRequest userRequest) {

      UserEntity newUser=  convertToEntity(userRequest);
      newUser=userRepsitory.save(newUser);
    return  convertToResponse(newUser);


    }

    @Override
    public String findByUserId() {
      String loggedInUserEmail= authenticationFacade.getAuthentication().getName();
     UserEntity loggedInUser= userRepsitory.findByEmail(loggedInUserEmail).orElseThrow(()->new UsernameNotFoundException( "User not found"));
     return loggedInUser.getId() ;

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
