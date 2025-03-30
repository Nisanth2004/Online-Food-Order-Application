package com.nisanth.foodapi.service;

import com.nisanth.foodapi.io.UserRequest;
import com.nisanth.foodapi.io.UserResponse;

public interface UserService {

   UserResponse registerUser(UserRequest userRequest);

  String findByUserId( String  email);
}
