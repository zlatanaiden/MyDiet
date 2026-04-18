package com.mydiet.backend.repository;

import com.mydiet.backend.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    
    List<Comment> findByPostId(Long postId);

    // Check if user liked comment
    @Query(value = "SELECT COUNT(*) FROM comment_likes WHERE comment_id = :commentId AND user_id = :userId", nativeQuery = true)
    int checkUserLikedComment(@Param("commentId") Long commentId, @Param("userId") Long userId);

    // Insert comment like record
    @Modifying
    @Transactional
    @Query(value = "INSERT IGNORE INTO comment_likes (comment_id, user_id) VALUES (:commentId, :userId)", nativeQuery = true)
    void addCommentLike(@Param("commentId") Long commentId, @Param("userId") Long userId);

    // Delete comment like record
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM comment_likes WHERE comment_id = :commentId AND user_id = :userId", nativeQuery = true)
    void removeCommentLike(@Param("commentId") Long commentId, @Param("userId") Long userId);
}