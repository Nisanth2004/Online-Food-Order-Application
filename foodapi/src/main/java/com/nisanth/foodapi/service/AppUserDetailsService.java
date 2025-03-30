package com.nisanth.foodapi.service;

import com.nisanth.foodapi.entity.UserEntity;
import com.nisanth.foodapi.repository.UserRepsitory;
import lombok.AllArgsConstructor;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;


@Service
@AllArgsConstructor
public class AppUserDetailsService implements UserDetailsService {

    private final UserRepsitory userRepsitory;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
       UserEntity user=  userRepsitory.findByEmail(email)
                .orElseThrow(()->new UsernameNotFoundException("User not found"));
      return new User(user.getEmail(), user.getPassword(), Collections.emptyList());

    }
}
