package com.nisanth.foodapi.service;

import com.nisanth.foodapi.io.user.UserRequest;
import com.nisanth.foodapi.io.user.UserResponse;

public interface UserService {

   UserResponse registerUser(UserRequest userRequest);

  String findByUserId();
}
