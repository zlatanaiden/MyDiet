package com.mydiet.backend.entity;

import java.util.List;

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

// Use LONGTEXT to allow storing very long Base64 image strings from the frontend
    @Column(name = "image_url", columnDefinition = "LONGTEXT")
    private String imageUrl;

    @Column(columnDefinition = "INT DEFAULT 0")
    private Integer likes = 0;

    // JSON fields can be mapped as Strings in Java for simplicity,
    // or mapped to custom objects. We use String here for an easy start.
    @Column(columnDefinition = "JSON")
    private String tags;

    @Column(columnDefinition = "JSON")
    private String nutrition;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    // A temporary pocket to hold comments when sending data to the frontend.
    // @Transient means "do not try to find this column in the MySQL database".
    @Transient
    private List<Comment> comments;

    @Transient
    private String authorName;

    @Transient
    private String authorAvatarGradient;

    // CRITICAL FIX: Flag to tell the frontend if the requesting user liked this post
    @Transient
    private Boolean isLikedByCurrentUser;
}