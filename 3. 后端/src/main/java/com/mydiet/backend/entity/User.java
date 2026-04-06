package com.mydiet.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * User Entity - Maps to the 'users' table in MySQL
 */
@Data // Lombok annotation to auto-generate getters, setters, and toString methods
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String uid;

    @Column(nullable = false)
    private String username;

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