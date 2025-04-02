package com.nisanth.foodapi.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.KeyPair;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

import io.jsonwebtoken.Jwts;

@Component
public class JwtUtil {

    @Value("${jwt.secret.key}")
    private String SECRET_KEY;
    private static final KeyPair keyPair = KeyGeneratorUtil.getKeyPair();
// Generate EC KeyPair


    public String generateToken(UserDetails userDetails)
    {
        Map<String,Object> claims=new HashMap<>();
        return createToken(claims,userDetails.getUsername());
        

    }

    private String createToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 10)) // 10 hrs
                .signWith(keyPair.getPrivate(), SignatureAlgorithm.ES256) // Use EC private key
                .compact();
    }


    public String extractUsername(String token)
    {
        return extractClaim(token, Claims::getSubject);
    }

    public Date extractExpiration(String token)
    {
        return extractClaim(token,Claims::getExpiration);
    }

    public <T>  T extractClaim(String token, Function<Claims,T> claimsResolver) {
        final Claims claims=extractAllClaims(token);
        return claimsResolver.apply(claims);
        
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(keyPair.getPublic()) // Use public key for verification
                .build()
                .parseClaimsJws(token)
                .getBody();
    }


    public Boolean isTokenExpired(String token)
    {
        return extractExpiration(token).before(new Date());
    }
    public Boolean validateToken(String token,UserDetails userDetails)
    {
        final String username=extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));

    }



}
