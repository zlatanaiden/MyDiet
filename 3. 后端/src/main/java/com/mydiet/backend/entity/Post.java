package com.mydiet.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * Post Entity - Maps to the 'posts' table in MySQL
 */
@Data
@Entity
@Table(name = "posts")
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // We use Long here to keep things simple and directly map the foreign key
    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(name = "image_url")
    private String imageUrl;

    // JSON fields can be mapped as Strings in Java for simplicity,
    // or mapped to custom objects. We use String here for an easy start.
    @Column(columnDefinition = "JSON")
    private String tags;

    @Column(columnDefinition = "JSON")
    private String nutrition;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}