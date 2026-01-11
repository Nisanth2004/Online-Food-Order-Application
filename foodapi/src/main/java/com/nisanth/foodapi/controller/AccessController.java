package com.nisanth.foodapi.controller;


import com.nisanth.foodapi.enumeration.AccountRole;

import com.nisanth.foodapi.io.admin.AccessRequest;
import com.nisanth.foodapi.io.admin.AccessResponse;
import com.nisanth.foodapi.service.security.AccessService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/access")
@RequiredArgsConstructor
public class AccessController {

    private final AccessService accessService;

    @PostMapping("/admin/login")
    public AccessResponse adminLogin(@RequestBody AccessRequest request) {
        return accessService.grantAccess(request, AccountRole.ADMIN);
    }

    @PostMapping("/vendor/login")
    public AccessResponse vendorLogin(@RequestBody AccessRequest request) {
        return accessService.grantAccess(request, AccountRole.VENDOR);
    }
}
