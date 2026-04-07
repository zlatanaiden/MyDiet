package com.mydiet.backend.controller;

import com.mydiet.backend.entity.User;
import com.mydiet.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Auth Controller - Handles register and login requests.
 */
@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    /**
     * Register a new local user
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String email = body.get("email");
        String password = body.get("password");

        if (username == null || username.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(createMessage("Username is required"));
        }

        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(createMessage("Email is required"));
        }

        if (password == null || password.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(createMessage("Password is required"));
        }

        email = email.trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(createMessage("Email already exists"));
        }

        User user = new User();
        user.setUsername(username.trim());
        user.setEmail(email);
        user.setPassword(password); // later you should hash it
        user.setProvider("local");
        user.setProviderUserId(null);
        user.setAvatarUrl(null);
        user.setAvatarGradient(null);

        User savedUser = userRepository.save(user);

        return ResponseEntity.ok(createUserResponse(savedUser, "Account created successfully"));
    }

    /**
     * Login with local email and password
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");

        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(createMessage("Email is required"));
        }

        if (password == null || password.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(createMessage("Password is required"));
        }

        email = email.trim().toLowerCase();

        Optional<User> optionalUser = userRepository.findByEmail(email);

        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createMessage("Invalid email or password"));
        }

        User user = optionalUser.get();

        if (user.getPassword() == null || !user.getPassword().equals(password)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createMessage("Invalid email or password"));
        }

        return ResponseEntity.ok(createUserResponse(user, "Login successful"));
    }

    private Map<String, Object> createMessage(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", message);
        return response;
    }

    private Map<String, Object> createUserResponse(User user, String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", message);
        response.put("id", user.getId());
        response.put("email", user.getEmail());
        response.put("username", user.getUsername());
        response.put("provider", user.getProvider());
        response.put("avatarUrl", user.getAvatarUrl());
        response.put("avatarGradient", user.getAvatarGradient());
        return response;
    }
}