package com.mydiet.backend.repository;

import com.mydiet.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * User Repository - Provides built-in CRUD operations for the User entity.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // You can leave this completely empty!
    // JpaRepository automatically provides methods like save(), findById(), findAll(), deleteById(), etc.
}