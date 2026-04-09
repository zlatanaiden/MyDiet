package com.mydiet.backend.controller;

import com.mydiet.backend.entity.Post;
import com.mydiet.backend.entity.Comment;
import com.mydiet.backend.entity.User;
import com.mydiet.backend.repository.PostRepository;
import com.mydiet.backend.repository.CommentRepository;
import com.mydiet.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "*")
public class PostController {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Get all posts (with comments and dynamic Like status for the current user)
     */
    @GetMapping
    public List<Post> getAllPosts(@RequestParam(required = false) Long userId) {
        List<Post> posts = postRepository.findAll();
        
        for (Post post : posts) {
            // Set Author details
            User author = userRepository.findById(post.getUserId()).orElse(null);
            if (author != null) {
                post.setAuthorName(author.getUsername());
                post.setAuthorAvatarGradient(author.getAvatarGradient());
            }

            // CRITICAL FIX: Check if the specific user liked this post
            if (userId != null) {
                int likeCount = postRepository.checkUserLikedPost(post.getId(), userId);
                post.setIsLikedByCurrentUser(likeCount > 0);
            } else {
                post.setIsLikedByCurrentUser(false);
            }

            // Process Comments
            List<Comment> postComments = commentRepository.findByPostId(post.getId());
            for (Comment c : postComments) {
                User cAuthor = userRepository.findById(c.getUserId()).orElse(null);
                if (cAuthor != null) {
                    c.setAuthorName(cAuthor.getUsername());
                    c.setAuthorAvatarGradient(cAuthor.getAvatarGradient());
                }
                
                // CRITICAL FIX: Check if the specific user liked this comment
                if (userId != null) {
                    int commentLikeCount = commentRepository.checkUserLikedComment(c.getId(), userId);
                    c.setIsLikedByCurrentUser(commentLikeCount > 0);
                } else {
                    c.setIsLikedByCurrentUser(false);
                }
            }
            post.setComments(postComments);
        }
        
        return posts;
    }

    @PostMapping
    public Post createPost(@RequestBody Post newPost) {
        if (newPost.getUserId() == null) {
            newPost.setUserId(1L); 
        }
        Post savedPost = postRepository.save(newPost);
        User author = userRepository.findById(savedPost.getUserId()).orElse(null);
        if (author != null) {
            savedPost.setAuthorName(author.getUsername());
            savedPost.setAuthorAvatarGradient(author.getAvatarGradient());
        }
        return savedPost;
    }

    @PostMapping("/{postId}/comments")
    public Comment addComment(@PathVariable Long postId, @RequestBody Comment newComment) {
        newComment.setPostId(postId);
        if (newComment.getUserId() == null) {
            newComment.setUserId(1L);
        }
        
        Comment savedComment = commentRepository.save(newComment);
        User author = userRepository.findById(savedComment.getUserId()).orElse(null);
        if (author != null) {
            savedComment.setAuthorName(author.getUsername());
            savedComment.setAuthorAvatarGradient(author.getAvatarGradient());
        }
        return savedComment;
    }

    /**
     * Toggle Post Like (Writes to DB and Junction Table)
     */
    @PutMapping("/{postId}/like")
    public Post toggleLike(@PathVariable Long postId, @RequestParam Long userId, @RequestParam boolean isLike) {
        Post post = postRepository.findById(postId).orElseThrow(() -> new RuntimeException("Post not found"));
        
        if (isLike) {
            postRepository.addPostLike(postId, userId);
            post.setLikes(post.getLikes() + 1);
        } else {
            postRepository.removePostLike(postId, userId);
            post.setLikes(Math.max(0, post.getLikes() - 1));
        }
        
        return postRepository.save(post);
    }

    /**
     * Toggle Comment Like (Writes to DB and Junction Table)
     */
    @PutMapping("/comments/{commentId}/like")
    public Comment toggleCommentLike(@PathVariable Long commentId, @RequestParam Long userId, @RequestParam boolean isLike) {
        Comment comment = commentRepository.findById(commentId).orElseThrow(() -> new RuntimeException("Comment not found"));
        
        if (isLike) {
            commentRepository.addCommentLike(commentId, userId);
            comment.setLikes(comment.getLikes() + 1);
        } else {
            commentRepository.removeCommentLike(commentId, userId);
            comment.setLikes(Math.max(0, comment.getLikes() - 1));
        }
        
        return commentRepository.save(comment);
    }
}