package com.nisanth.foodapi.entity;

import com.nisanth.foodapi.enumeration.KycStatus;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "vendor_kyc")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VendorKycEntity {

    @Id
    private String id;

    private String vendorId;

    // LEGAL
    private String gstNumber;
    private String panNumber;
    private String businessType; // PROPRIETOR / LLP / PVT_LTD

    private String gstCertificateUrl;
    private String panCardUrl;

    // BANK
    private String bankAccountName;
    private String bankName;
    private String bankAccountNumber;
    private String ifscCode;
    private String cancelledChequeUrl;

    // KYC STATUS
    private KycStatus kycStatus; // PENDING / VERIFIED / REJECTED
}
