package com.nisanth.foodapi.controller;

import com.nisanth.foodapi.entity.AccountEntity;
import com.nisanth.foodapi.entity.Setting;
import com.nisanth.foodapi.entity.VendorEntity;
import com.nisanth.foodapi.entity.VendorKycEntity;
import com.nisanth.foodapi.enumeration.AccountRole;
import com.nisanth.foodapi.enumeration.AccountStatus;
import com.nisanth.foodapi.enumeration.KycStatus;
import com.nisanth.foodapi.io.admin.VendorRegisterRequest;
import com.nisanth.foodapi.io.vendors.VendorKycRequest;
import com.nisanth.foodapi.io.vendors.VendorProfileUpdateRequest;
import com.nisanth.foodapi.repository.AccountRepository;
import com.nisanth.foodapi.repository.VendorKycRepository;
import com.nisanth.foodapi.repository.VendorRepository;
import com.nisanth.foodapi.service.SettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectResponse;

import java.io.IOException;
import java.util.UUID;

@RestController
@RequestMapping("/api/vendor")
@RequiredArgsConstructor
public class VendorOnboardingController {

    private final AccountRepository accountRepository;
    private final VendorRepository vendorRepository;
    private final VendorKycRepository vendorKycRepository;
    private final PasswordEncoder passwordEncoder;
    @Autowired
    private S3Client s3Client;

    @Autowired
    private SettingService settingService;

    @PostMapping("/register")
    public String registerVendor(@RequestBody VendorRegisterRequest req) {

        if (accountRepository.findByEmail(req.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }

        AccountEntity account = AccountEntity.builder()
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .role(AccountRole.VENDOR)
                .status(AccountStatus.DRAFT)
                .build();

        AccountEntity savedAccount = accountRepository.save(account);

        VendorEntity vendor = VendorEntity.builder()
                .accountId(savedAccount.getId())
                .companyName(req.getCompanyName())
                .phone(req.getPhone())
                .build();

        vendorRepository.save(vendor);

        return "Vendor registered successfully";
    }

    @PutMapping("/profile")
    public String updateVendorProfile(
            @RequestBody VendorProfileUpdateRequest req,
            Authentication auth
    ) {
        AccountEntity account = getAccount(auth);

        VendorEntity vendor = vendorRepository
                .findByAccountId(account.getId())
                .orElseThrow();

        vendor.setCompanyName(req.getCompanyName());
        vendor.setBrandName(req.getBrandName());
        vendor.setContactPerson(req.getContactPerson());
        vendor.setPhone(req.getPhone());

        vendor.setAddressLine1(req.getAddressLine1());
        vendor.setCity(req.getCity());
        vendor.setState(req.getState());
        vendor.setPincode(req.getPincode());
        vendor.setAddressLine2(req.getAddressLine2());
        vendor.setCountry(req.getCountry());



        vendorRepository.save(vendor);
        return "Vendor profile saved";
    }

    @PostMapping(value = "/kyc", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public String submitKyc(
            @RequestPart("data") VendorKycRequest req,
            @RequestPart("gstFile") MultipartFile gstFile,
            @RequestPart("panFile") MultipartFile panFile,
            Authentication auth
    ) {
        AccountEntity account = getAccount(auth);

        VendorEntity vendor = vendorRepository
                .findByAccountId(account.getId())
                .orElseThrow();

        String gstUrl = uploadFile(gstFile);
        String panUrl = uploadFile(panFile);

        VendorKycEntity kyc = VendorKycEntity.builder()
                .vendorId(vendor.getId())
                .gstNumber(req.getGstNumber())
                .panNumber(req.getPanNumber())
                .businessType(req.getBusinessType())
                .bankAccountName(req.getBankAccountName())
                .bankName(req.getBankName())
                .bankAccountNumber(req.getBankAccountNumber())
                .ifscCode(req.getIfscCode())
                .gstCertificateUrl(gstUrl)
                .panCardUrl(panUrl)
                .kycStatus(KycStatus.PENDING)
                .build();

        vendorKycRepository.save(kyc);
        return "KYC submitted for verification";
    }

    private AccountEntity getAccount(Authentication authentication) {
        String email = authentication.getName();
        return accountRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Account not found"));
    }


    public String uploadFile(MultipartFile file) {
        String fileNameExtension = file.getOriginalFilename()
                .substring(file.getOriginalFilename().lastIndexOf(".") + 1);

        String key = UUID.randomUUID().toString() + "." + fileNameExtension;
        Setting s = settingService.getSettings();
        String bucketName = s.getAwsBucket();

        try {
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .acl("public-read")
                    .contentType(file.getContentType())
                    .build();

            PutObjectResponse response = s3Client.putObject(
                    putObjectRequest,
                    software.amazon.awssdk.core.sync.RequestBody.fromBytes(file.getBytes())
            );

            if (response.sdkHttpResponse().isSuccessful()) {
                return "https://" + bucketName + ".s3.amazonaws.com/" + key;
            } else {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "File Upload failed");
            }
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error uploading file");
        }
    }

}
