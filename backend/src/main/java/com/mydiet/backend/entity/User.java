package com.mydiet.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column
    private String password;

    @Column(nullable = false)
    private String username;

    @Column(nullable = false)
    private String provider;

    @Column(name = "provider_user_id")
    private String providerUserId;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "avatar_gradient")
    private String avatarGradient;

    // ---- Profile fields ----
    @Column
    private Integer age;

    @Column
    private String gender;

    @Column(name = "height_cm")
    private Double heightCm;

    @Column(name = "weight_kg")
    private Double weightKg;

    @Column(name = "target_weight")
    private Double targetWeight;

    @Column
    private String goal;

    @Column(name = "activity_level")
    private String activityLevel;

    @Column(columnDefinition = "JSON")
    private String allergies;

    @Column(columnDefinition = "JSON")
    private String restrictions;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}