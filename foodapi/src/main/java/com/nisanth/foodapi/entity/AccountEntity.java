package com.nisanth.foodapi.entity;

import com.nisanth.foodapi.enumeration.AccountRole;
import com.nisanth.foodapi.enumeration.AccountStatus;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "accounts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccountEntity {

    @Id
    private String id; // MongoDB uses String/ObjectId

    private String email;

    private String password;

    private AccountRole role;

    private AccountStatus status;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
