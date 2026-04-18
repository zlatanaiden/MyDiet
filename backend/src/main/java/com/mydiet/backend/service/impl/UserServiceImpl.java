package com.mydiet.backend.service.impl;

import com.mydiet.backend.dto.UserLoginDTO;
import com.mydiet.backend.dto.UserRegisterDTO;
import com.mydiet.backend.entity.User;
import com.mydiet.backend.repository.UserRepository;
import com.mydiet.backend.service.UserService;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public User registerUser(UserRegisterDTO registerDto) {

        // 1. Check if email already exists
        Optional<User> existingUser = userRepository.findByEmail(registerDto.getEmail());
        if (existingUser.isPresent()) {
            throw new RuntimeException("Email is already registered.");
        }

        // 2. Hash password
        String hashedPassword = BCrypt.hashpw(registerDto.getPassword(), BCrypt.gensalt());

        // 3. Create user
        User user = new User();
        user.setUsername(
            registerDto.getUsername() != null
                ? registerDto.getUsername()
                : "User_" + UUID.randomUUID().toString().substring(0, 8)
        );
        user.setEmail(registerDto.getEmail());
        user.setPassword(hashedPassword);
        user.setProvider("local"); // 很重要，加这个

        return userRepository.save(user);
    }

    @Override
    public User loginUser(UserLoginDTO loginDto) {

        // 1. Find user
        Optional<User> optionalUser = userRepository.findByEmail(loginDto.getEmail());
        if (optionalUser.isEmpty()) {
            throw new RuntimeException("User not found.");
        }

        User user = optionalUser.get();

        // 2. Check password
        boolean match = BCrypt.checkpw(loginDto.getPassword(), user.getPassword());
        if (!match) {
            throw new RuntimeException("Invalid password.");
        }

        return user;
    }
}