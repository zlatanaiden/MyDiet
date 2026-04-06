package com.mydiet.backend.controller;

import com.mydiet.backend.entity.Post;
import com.mydiet.backend.entity.Comment;
import com.mydiet.backend.repository.PostRepository;
import com.mydiet.backend.repository.CommentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Post Controller - Handles HTTP requests for posts and their comments.
 */
@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "*")
public class PostController {

    @Autowired
    private PostRepository postRepository;

    // 1. Inject the CommentRepository so we can fetch and save comments
    @Autowired
    private CommentRepository commentRepository;

    /**
     * Get all posts (with their comments attached)
     * Endpoint: GET http://localhost:8080/api/posts
     */
    @GetMapping
    public List<Post> getAllPosts() {
        List<Post> posts = postRepository.findAll();
        
        // Loop through each post, fetch its comments from the database, and attach them
        for (Post post : posts) {
            List<Comment> postComments = commentRepository.findByPostId(post.getId());
            post.setComments(postComments);
        }
        
        return posts;
    }

    /**
     * Create a new post
     * Endpoint: POST http://localhost:8080/api/posts
     */
    @PostMapping
    public Post createPost(@RequestBody Post newPost) {
        if (newPost.getUserId() == null) {
            newPost.setUserId(1L); // Fallback if frontend forgot
        }
        return postRepository.save(newPost);
    }

    /**
     * --- NEW: Add a comment to a specific post ---
     * Endpoint: POST http://localhost:8080/api/posts/{postId}/comments
     */
    @PostMapping("/{postId}/comments")
    public Comment addComment(@PathVariable Long postId, @RequestBody Comment newComment) {
        // Link the comment to the specific post
        newComment.setPostId(postId);
        if (newComment.getUserId() == null) {
            newComment.setUserId(1L); // Fallback
        }
        
        return commentRepository.save(newComment);
    }

    /**
     * --- NEW: Toggle Like ---
     * Endpoint: PUT http://localhost:8080/api/posts/{postId}/like?isLike=true
     */
    @PutMapping("/{postId}/like")
    public Post toggleLike(@PathVariable Long postId, @RequestParam boolean isLike) {
        // Find the target post
        Post post = postRepository.findById(postId).orElseThrow(() -> new RuntimeException("Post not found"));
        
        // Increase or decrease the like count
        if (isLike) {
            post.setLikes(post.getLikes() + 1);
        } else {
            post.setLikes(Math.max(0, post.getLikes() - 1)); // Prevent negative likes
        }
        
        return postRepository.save(post);
    }

    /**
     * --- NEW: Toggle Comment Like ---
     * Endpoint: PUT http://localhost:8080/api/posts/comments/{commentId}/like?isLike=true
     */
    @PutMapping("/comments/{commentId}/like")
    public Comment toggleCommentLike(@PathVariable Long commentId, @RequestParam boolean isLike) {
        // Find the target comment directly by its ID
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        
        // Update the like count
        if (isLike) {
            comment.setLikes(comment.getLikes() + 1);
        } else {
            comment.setLikes(Math.max(0, comment.getLikes() - 1));
        }
        
        return commentRepository.save(comment);
    }
}