package com.mydiet.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * User Entity - Maps to the 'users' table in MySQL
 */
@Data
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // local users use email; google/apple users also keep email if available
    @Column(nullable = false, unique = true)
    private String email;

    // local login password; can be empty for google/apple accounts
    @Column
    private String password;

    @Column(nullable = false)
    private String username;

    // local / google / apple
    @Column(nullable = false)
    private String provider;

    // unique user id from google/apple, can be null for local accounts
    @Column(name = "provider_user_id")
    private String providerUserId;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "avatar_gradient")
    private String avatarGradient;

    // Login required fields
    @Column(nullable = false)
    private String password;

    @Column(unique = true)
    private String email;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}