package com.nisanth.foodapi.service.impl;

import com.nisanth.foodapi.service.AuthenticationFacade;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class AuthenticatioFacadeImpl implements AuthenticationFacade {
    @Override
    public Authentication getAuthentication() {
      return  SecurityContextHolder.getContext().getAuthentication();

    }
}
