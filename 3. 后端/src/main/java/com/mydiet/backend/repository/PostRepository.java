package com.mydiet.backend.repository;

import com.mydiet.backend.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Post Repository - Provides built-in CRUD operations for the Post entity.
 */
@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
}