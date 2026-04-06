package com.mydiet.backend.service;

import com.mydiet.backend.entity.User;
import com.mydiet.backend.dto.UserRegisterDTO;
import com.mydiet.backend.dto.UserLoginDTO;

public interface UserService {
    User registerUser(UserRegisterDTO registerDto);
    User loginUser(UserLoginDTO loginDto);
}
