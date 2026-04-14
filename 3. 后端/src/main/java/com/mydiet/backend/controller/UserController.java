package com.mydiet.backend.controller;

import com.mydiet.backend.dto.UserLoginDTO;
import com.mydiet.backend.dto.UserProfileDTO;
import com.mydiet.backend.dto.UserRegisterDTO;
import com.mydiet.backend.entity.User;
import com.mydiet.backend.repository.UserRepository;
import com.mydiet.backend.service.UserService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody UserRegisterDTO registerDto) {
        try {
            User registeredUser = userService.registerUser(registerDto);
            registeredUser.setPassword(null);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Registration successful");
            response.put("user", buildUserResponse(registeredUser));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResp = new HashMap<>();
            errorResp.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResp);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody UserLoginDTO loginDto) {
        try {
            User user = userService.loginUser(loginDto);
            user.setPassword(null);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Login successful");
            response.put("user", buildUserResponse(user));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResp = new HashMap<>();
            errorResp.put("error", "Login failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResp);
        }
    }

    @GetMapping("/{id}/profile")
    public ResponseEntity<?> getProfile(@PathVariable Long id) {
        Optional<User> optUser = userRepository.findById(id);
        if (optUser.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        User user = optUser.get();
        Map<String, Object> profile = new HashMap<>();
        profile.put("age", user.getAge());
        profile.put("gender", user.getGender());
        profile.put("heightCm", user.getHeightCm());
        profile.put("weightKg", user.getWeightKg());
        profile.put("targetWeight", user.getTargetWeight());
        profile.put("goal", user.getGoal());
        profile.put("activityLevel", user.getActivityLevel());
        profile.put("allergies", parseJsonList(user.getAllergies()));
        profile.put("restrictions", parseJsonList(user.getRestrictions()));
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/{id}/profile")
    public ResponseEntity<?> updateProfile(@PathVariable Long id, @RequestBody UserProfileDTO dto) {
        Optional<User> optUser = userRepository.findById(id);
        if (optUser.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        User user = optUser.get();
        if (dto.getAge() != null) user.setAge(dto.getAge());
        if (dto.getGender() != null) user.setGender(dto.getGender());
        if (dto.getHeightCm() != null) user.setHeightCm(dto.getHeightCm());
        if (dto.getWeightKg() != null) user.setWeightKg(dto.getWeightKg());
        if (dto.getTargetWeight() != null) user.setTargetWeight(dto.getTargetWeight());
        if (dto.getGoal() != null) user.setGoal(dto.getGoal());
        if (dto.getActivityLevel() != null) user.setActivityLevel(dto.getActivityLevel());
        if (dto.getAllergies() != null) user.setAllergies(toJson(dto.getAllergies()));
        if (dto.getRestrictions() != null) user.setRestrictions(toJson(dto.getRestrictions()));

        userRepository.save(user);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Profile updated");
        response.put("profile", buildProfileMap(user));
        return ResponseEntity.ok(response);
    }

    // ---- Helper methods ----

    private Map<String, Object> buildUserResponse(User user) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", user.getId());
        map.put("username", user.getUsername());
        map.put("email", user.getEmail());
        map.put("avatarUrl", user.getAvatarUrl());
        map.put("avatarGradient", user.getAvatarGradient());
        // Include profile fields
        map.put("age", user.getAge());
        map.put("gender", user.getGender());
        map.put("heightCm", user.getHeightCm());
        map.put("weightKg", user.getWeightKg());
        map.put("targetWeight", user.getTargetWeight());
        map.put("goal", user.getGoal());
        map.put("activityLevel", user.getActivityLevel());
        map.put("allergies", parseJsonList(user.getAllergies()));
        map.put("restrictions", parseJsonList(user.getRestrictions()));
        return map;
    }

    private Map<String, Object> buildProfileMap(User user) {
        Map<String, Object> map = new HashMap<>();
        map.put("age", user.getAge());
        map.put("gender", user.getGender());
        map.put("heightCm", user.getHeightCm());
        map.put("weightKg", user.getWeightKg());
        map.put("targetWeight", user.getTargetWeight());
        map.put("goal", user.getGoal());
        map.put("activityLevel", user.getActivityLevel());
        map.put("allergies", parseJsonList(user.getAllergies()));
        map.put("restrictions", parseJsonList(user.getRestrictions()));
        return map;
    }

    private List<String> parseJsonList(String json) {
        if (json == null || json.isBlank()) return List.of();
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (JsonProcessingException e) {
            return List.of();
        }
    }

    private String toJson(List<String> list) {
        if (list == null) return "[]";
        try {
            return objectMapper.writeValueAsString(list);
        } catch (JsonProcessingException e) {
            return "[]";
        }
    }
}
