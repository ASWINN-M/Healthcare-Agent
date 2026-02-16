-- ═══════════════════════════════════════════
-- Healthcare Agent - Database Setup Script
-- ═══════════════════════════════════════════

-- 1) Users database
CREATE DATABASE IF NOT EXISTS `user`;
USE `user`;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARBINARY(255) NOT NULL
);

-- 2) Medical profiles database
CREATE DATABASE IF NOT EXISTS medical_profiles;
USE medical_profiles;

CREATE TABLE IF NOT EXISTS medical_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    blood_group VARCHAR(10),
    allergies TEXT
);

-- 3) Conversations database
CREATE DATABASE IF NOT EXISTS conversation;
USE conversation;

CREATE TABLE IF NOT EXISTS conversations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    role VARCHAR(10) NOT NULL,       -- 'user' or 'assistant'
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
