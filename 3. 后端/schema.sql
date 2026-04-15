-- ==========================================
-- MyDiet Complete Database Setup
-- ==========================================
-- This script creates ALL tables for both databases.
-- Table structures are also auto-managed by Hibernate (ddl-auto=update),
-- so simply starting the backend will create/update tables too.
-- However, recipe DATA (165,969 rows) must be imported from CSV separately.
--
-- QUICK START for teammates:
--   1. Start backend (mvnw spring-boot:run) → tables auto-created
--   2. Import recipe CSV → see import_recipes.py or bottom of this file
-- ==========================================

-- ==========================================
-- DATABASE 1: mydiet_db (users, posts, comments)
-- ==========================================
CREATE DATABASE IF NOT EXISTS mydiet_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE mydiet_db;

-- Users table (with profile fields for meal plan personalization + Google OAuth)
CREATE TABLE IF NOT EXISTS `users` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(255) NOT NULL COMMENT 'User nickname',
  `email` VARCHAR(255) NOT NULL UNIQUE COMMENT 'User email address',
  `password` VARCHAR(255) COMMENT 'Encrypted password (null for Google users)',
  `provider` VARCHAR(255) NOT NULL DEFAULT 'local' COMMENT 'Authentication provider (e.g., local, google)',
  `provider_user_id` VARCHAR(255) COMMENT 'Google sub ID for OAuth',
  `avatar_url` VARCHAR(255) COMMENT 'Real avatar image URL',
  `avatar_gradient` VARCHAR(255) COMMENT 'Gradient background from frontend',
  `created_at` DATETIME(6),
  -- Profile fields
  `age` INT,
  `gender` VARCHAR(255),
  `height_cm` DOUBLE,
  `weight_kg` DOUBLE,
  `target_weight` DOUBLE,
  `goal` VARCHAR(255),
  `activity_level` VARCHAR(255),
  `allergies` JSON,
  `restrictions` JSON
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Posts table
CREATE TABLE IF NOT EXISTS `posts` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT NOT NULL COMMENT 'Author ID',
  `title` VARCHAR(255) NOT NULL COMMENT 'Post title',
  `content` TEXT COMMENT 'Post content',
  `image_url` LONGTEXT COMMENT 'Image URL or Base64 encoded image string',
  `likes` INT DEFAULT 0 COMMENT 'Total number of likes',
  `tags` JSON COMMENT 'Array of tags, e.g., ["#30DayFatLoss", "#Healthy"]',
  `nutrition` JSON COMMENT 'Nutrition data object',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Comments table
CREATE TABLE IF NOT EXISTS `comments` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `post_id` BIGINT NOT NULL COMMENT 'Which post this belongs to',
  `user_id` BIGINT NOT NULL COMMENT 'Commenter ID',
  `parent_id` BIGINT NULL COMMENT 'Parent comment ID for replies; NULL for direct comments',
  `content` TEXT NOT NULL COMMENT 'Comment text',
  `likes` INT DEFAULT 0 COMMENT 'Total number of likes',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`parent_id`) REFERENCES `comments`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Post Likes table (Junction table to track which users liked which posts)
CREATE TABLE IF NOT EXISTS `post_likes` (
  `post_id` BIGINT NOT NULL,
  `user_id` BIGINT NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`post_id`, `user_id`),
  FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Comment Likes table (Junction table to track which users liked which comments)
CREATE TABLE IF NOT EXISTS `comment_likes` (
  `comment_id` BIGINT NOT NULL,
  `user_id` BIGINT NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`comment_id`, `user_id`),
  FOREIGN KEY (`comment_id`) REFERENCES `comments`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User Follows table (Junction table for follower/following relationships)
CREATE TABLE IF NOT EXISTS `user_follows` (
  `follower_id` BIGINT NOT NULL COMMENT 'Follower ID (Fan)',
  `following_id` BIGINT NOT NULL COMMENT 'Following ID (Blogger/Creator)',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`follower_id`, `following_id`),
  FOREIGN KEY (`follower_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`following_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- DATABASE 2: mydiet_nutrition (recipes + DRI)
-- ==========================================
CREATE DATABASE IF NOT EXISTS mydiet_nutrition DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE mydiet_nutrition;

-- Recipes table (165,969 rows — data imported from CSV)
CREATE TABLE IF NOT EXISTS `recipes` (
  `id` INT NOT NULL PRIMARY KEY COMMENT 'Food.com RecipeId',
  `name` VARCHAR(255) NOT NULL,
  `total_time` VARCHAR(255),
  `image_url` VARCHAR(600),
  `category` VARCHAR(255),
  `keywords` JSON,
  `ingredients` JSON,
  `quantities` JSON,
  `instructions` JSON,
  `calories` FLOAT,
  `fat_g` FLOAT,
  `saturated_fat_g` FLOAT,
  `cholesterol_mg` FLOAT,
  `sodium_mg` FLOAT,
  `carbohydrate_g` FLOAT,
  `fiber_g` FLOAT,
  `sugar_g` FLOAT,
  `protein_g` FLOAT,
  `servings` INT,
  `recipe_yield` VARCHAR(100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dietary Reference Intakes table (20 rows)
CREATE TABLE IF NOT EXISTS `dietary_references` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `age_group` VARCHAR(50),
  `gender` VARCHAR(20),
  `calories` INT,
  `protein_g` FLOAT,
  `carbohydrate_g` FLOAT,
  `fiber_g` FLOAT,
  `fat_g` FLOAT,
  `saturated_fat_g` FLOAT,
  `cholesterol_mg` FLOAT,
  `sodium_mg` FLOAT,
  `sugar_g` FLOAT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- MOCK DATA
-- ==========================================
USE mydiet_db;

-- Insert dummy users (with avatar_gradient for frontend display)
INSERT IGNORE INTO `users` (`id`, `email`, `password`, `username`, `provider`, `avatar_gradient`) VALUES
(1, 'sarah@example.com', '123456', 'Sarah_Fit', 'local', 'from-[#FBBF24] to-[#F97316]'),
(2, 'mike@example.com', '123456', 'ChefMike', 'local', 'from-[#4ADE80] to-[#22D3EE]');

-- Insert dummy posts
INSERT IGNORE INTO `posts` (`id`, `user_id`, `title`, `content`, `image_url`, `likes`, `tags`, `nutrition`) VALUES
(1, 1, '30-Day Fat Loss Journey: Week 2 Results!', 'Week 2 is done! Down 3.5kg already. The meal plans from MyDiet have been incredible...', 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=500&fit=crop', 3245, '["#30DayFatLoss"]', null),
(2, 2, 'Low-Cal Quick Dinner: Under 400kcal', 'This grilled salmon with roasted veggies is only 380 calories and takes 15 minutes!', 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=350&fit=crop', 2100, '["#LowCalDinner", "#QuickMeals"]', '{"calories": 380, "protein": 35, "carbs": 22, "fats": 16}');

-- Insert dummy comments
INSERT IGNORE INTO `comments` (`id`, `post_id`, `user_id`, `content`, `likes`) VALUES
(1, 1, 2, 'Amazing progress! Keep going!', 24);
