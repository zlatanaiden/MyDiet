-- 1. Create and use your database
CREATE DATABASE IF NOT EXISTS mydiet_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE mydiet_db;

-- 2. Users table (Updated to support Google OAuth integration)
CREATE TABLE `users` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL UNIQUE COMMENT 'User email address',
  `password` VARCHAR(255) COMMENT 'Encrypted password (null for Google users)',
  `username` VARCHAR(50) NOT NULL COMMENT 'User nickname',
  `provider` VARCHAR(50) NOT NULL COMMENT 'Authentication provider (e.g., local, google)',
  `provider_user_id` VARCHAR(255) COMMENT 'Google sub ID for OAuth',
  `avatar_url` VARCHAR(255) COMMENT 'Real avatar image URL',
  `avatar_gradient` VARCHAR(50) COMMENT 'Gradient background from frontend',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Posts table (Updated with LONGTEXT for images and likes count)
CREATE TABLE `posts` (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Comments table (Updated with likes count)
CREATE TABLE `comments` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `post_id` BIGINT NOT NULL COMMENT 'Which post this belongs to',
  `user_id` BIGINT NOT NULL COMMENT 'Commenter ID',
  `parent_id` BIGINT NULL COMMENT 'Parent comment ID if it is a reply; NULL if it is a direct comment on the post',
  `content` TEXT NOT NULL COMMENT 'Comment text',
  `likes` INT DEFAULT 0 COMMENT 'Total number of likes',     
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`parent_id`) REFERENCES `comments`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Post_Likes table (Junction table to track which users liked which posts)
CREATE TABLE `post_likes` (
  `post_id` BIGINT NOT NULL,
  `user_id` BIGINT NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`post_id`, `user_id`),
  FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. User_Follows table (Junction table for follower/following relationships)
CREATE TABLE `user_follows` (
  `follower_id` BIGINT NOT NULL COMMENT 'Follower ID (Fan)',
  `following_id` BIGINT NOT NULL COMMENT 'Following ID (Blogger/Creator)',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`follower_id`, `following_id`),
  FOREIGN KEY (`follower_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`following_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==========================================
-- INSERT INITIAL MOCK DATA
-- ==========================================

-- Insert dummy users for initial mock posts (Adapted for new Google Auth schema)
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