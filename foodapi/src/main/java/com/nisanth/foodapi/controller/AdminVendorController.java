package com.nisanth.foodapi.controller;

import com.nisanth.foodapi.entity.AccountEntity;
import com.nisanth.foodapi.entity.VendorEntity;
import com.nisanth.foodapi.entity.VendorKycEntity;
import com.nisanth.foodapi.enumeration.AccountStatus;
import com.nisanth.foodapi.enumeration.KycStatus;
import com.nisanth.foodapi.repository.AccountRepository;
import com.nisanth.foodapi.repository.VendorKycRepository;
import com.nisanth.foodapi.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/vendors")
@RequiredArgsConstructor
public class AdminVendorController {

    private final VendorRepository vendorRepository;
    private final AccountRepository accountRepository;

    private final VendorKycRepository vendorKycRepository;

    public record VendorResponse(
            String vendorId,
            String accountId,
            String companyName,
            String email,
            String phone,
            AccountStatus status,
            KycStatus kycStatus
    ) {}

    /** Get all vendors */
    @GetMapping
    public List<VendorResponse> getAllVendors() {
        return vendorRepository.findAll().stream().map(vendor -> {

            AccountEntity account = accountRepository.findById(vendor.getAccountId())
                    .orElseThrow();

            VendorKycEntity kyc = vendorKycRepository
                    .findByVendorId(vendor.getId())
                    .orElse(null);

            return new VendorResponse(
                    vendor.getId(),
                    vendor.getAccountId(),
                    vendor.getCompanyName(),
                    account.getEmail(),
                    vendor.getPhone(),
                    account.getStatus(),
                    kyc != null ? kyc.getKycStatus() : KycStatus.PENDING
            );

        }).toList();
    }


    @PutMapping("/{vendorId}/approve")
    public String approveVendor(@PathVariable String vendorId) {

        VendorKycEntity kyc = vendorKycRepository
                .findByVendorId(vendorId)
                .orElseThrow();

        kyc.setKycStatus(KycStatus.VERIFIED);
        vendorKycRepository.save(kyc);

        VendorEntity vendor = vendorRepository.findById(vendorId).orElseThrow();
        AccountEntity account = accountRepository
                .findById(vendor.getAccountId())
                .orElseThrow();

        account.setStatus(AccountStatus.ACTIVE);
        accountRepository.save(account);

        return "Vendor approved successfully";
    }

    /** Approve / Reject vendor */


    public static record StatusRequest(String action) {}

    @GetMapping("/{vendorId}")
    public VendorDetailsResponse getVendorDetails(@PathVariable String vendorId) {

        VendorEntity vendor = vendorRepository.findById(vendorId).orElseThrow();
        AccountEntity account = accountRepository.findById(vendor.getAccountId()).orElseThrow();
        VendorKycEntity kyc = vendorKycRepository.findByVendorId(vendorId).orElse(null);

        return new VendorDetailsResponse(
                vendor.getId(),
                vendor.getAccountId(),
                vendor.getCompanyName(),
                vendor.getBrandName(),
                vendor.getContactPerson(),
                vendor.getPhone(),
                account.getEmail(),
                account.getStatus(),

                vendor.getAddressLine1(),
                vendor.getAddressLine2(),
                vendor.getCity(),
                vendor.getState(),
                vendor.getPincode(),
                vendor.getCountry(),

                kyc
        );
    }

    public record VendorDetailsResponse(
            String vendorId,
            String accountId,

            String companyName,
            String brandName,
            String contactPerson,
            String phone,
            String email,
            AccountStatus accountStatus,

            String addressLine1,
            String addressLine2,
            String city,
            String state,
            String pincode,
            String country,

            VendorKycEntity kyc
    ) {}
    @PutMapping("/{vendorId}/reject")
    public String rejectVendor(@PathVariable String vendorId) {

        VendorKycEntity kyc = vendorKycRepository.findByVendorId(vendorId).orElseThrow();
        kyc.setKycStatus(KycStatus.REJECTED);
        vendorKycRepository.save(kyc);

        VendorEntity vendor = vendorRepository.findById(vendorId).orElseThrow();
        AccountEntity account = accountRepository.findById(vendor.getAccountId()).orElseThrow();

        account.setStatus(AccountStatus.BLOCKED);
        accountRepository.save(account);

        return "Vendor rejected";
    }


}
