package com.nisanth.foodapi.util;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.NoSuchAlgorithmException;

public class KeyGeneratorUtil {

    private static final KeyPair keyPair = generateKeyPair();  // ✅ Call the actual method

    private static KeyPair generateKeyPair() {
        try {
            KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("EC");
            keyPairGenerator.initialize(256);
            return keyPairGenerator.generateKeyPair();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error generating EC key pair", e);
        }
    }

    public static KeyPair getKeyPair() {
        return keyPair;
    }
}
