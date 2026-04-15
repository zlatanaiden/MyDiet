package com.mydiet.backend.repository;

import com.mydiet.backend.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    
    // Check if user liked post
    @Query(value = "SELECT COUNT(*) FROM post_likes WHERE post_id = :postId AND user_id = :userId", nativeQuery = true)
    int checkUserLikedPost(@Param("postId") Long postId, @Param("userId") Long userId);

    // Insert like record
    @Modifying
    @Transactional
    @Query(value = "INSERT IGNORE INTO post_likes (post_id, user_id) VALUES (:postId, :userId)", nativeQuery = true)
    void addPostLike(@Param("postId") Long postId, @Param("userId") Long userId);

    // Delete like record
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM post_likes WHERE post_id = :postId AND user_id = :userId", nativeQuery = true)
    void removePostLike(@Param("postId") Long postId, @Param("userId") Long userId);
}