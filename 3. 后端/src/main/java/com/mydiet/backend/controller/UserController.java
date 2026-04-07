package com.mydiet.backend.controller;

import com.mydiet.backend.dto.UserLoginDTO;
import com.mydiet.backend.dto.UserRegisterDTO;
import com.mydiet.backend.entity.User;
import com.mydiet.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
// Allow跨域，真实环境最好配置具体的域
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody UserRegisterDTO registerDto) {
        try {
            User registeredUser = userService.registerUser(registerDto);
            
            // 为了安全，不将密码返回给前端
            registeredUser.setPassword(null);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Registration successful");
            response.put("user", registeredUser);
            
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
            
            // 为了安全，绝对不能把加密的哈希值回传给前端，即使是加密的
            user.setPassword(null);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Login successful");
            response.put("user", user); // 前端从这里面可以读到 user.id 用于后续发帖
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> errorResp = new HashMap<>();
            errorResp.put("error", "Login failed: " + e.getMessage());
             // 通常为了安全，账号没找到和密码错应该返回统一信息，这里为了方便调试分开了
            return ResponseEntity.badRequest().body(errorResp);
        }
    }
}
