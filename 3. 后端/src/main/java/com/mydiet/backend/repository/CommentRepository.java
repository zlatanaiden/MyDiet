package com.mydiet.backend.repository;

import com.mydiet.backend.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Comment Repository - Provides database operations for comments.
 */
@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    
    // Spring Boot Magic: Just by naming this method correctly, 
    // it automatically generates the SQL to find all comments for a specific post!
    List<Comment> findByPostId(Long postId);
}