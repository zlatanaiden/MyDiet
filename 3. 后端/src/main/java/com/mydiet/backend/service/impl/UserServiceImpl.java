package com.mydiet.backend.service.impl;

import com.mydiet.backend.dto.UserLoginDTO;
import com.mydiet.backend.dto.UserRegisterDTO;
import com.mydiet.backend.entity.User;
import com.mydiet.backend.repository.UserRepository;
import com.mydiet.backend.service.UserService;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public User registerUser(UserRegisterDTO registerDto) {
        // 1. Check if email already exists
        User existingUser = userRepository.findByEmail(registerDto.getEmail());
        if (existingUser != null) {
            throw new RuntimeException("Email is already registered.");
        }

        // 2. Hash the password using jBCrypt
        String hashedPassword = BCrypt.hashpw(registerDto.getPassword(), BCrypt.gensalt());

        // 3. Create new user entity and save
        User user = new User();
        user.setUsername(registerDto.getUsername() != null ? registerDto.getUsername() : "User_" + UUID.randomUUID().toString().substring(0, 8));
        user.setEmail(registerDto.getEmail());
        user.setPassword(hashedPassword);
        
        // Generate a random UID as it's required by the existing User entity rules
        user.setUid(UUID.randomUUID().toString());

        return userRepository.save(user);
    }

    @Override
    public User loginUser(UserLoginDTO loginDto) {
        // 1. Find user by email
        User user = userRepository.findByEmail(loginDto.getEmail());
        if (user == null) {
            throw new RuntimeException("User not found.");
        }

        // 2. Check password matches
        boolean passwordMatches = BCrypt.checkpw(loginDto.getPassword(), user.getPassword());
        if (!passwordMatches) {
            throw new RuntimeException("Invalid password.");
        }

        // 3. Return user
        return user;
    }
}
