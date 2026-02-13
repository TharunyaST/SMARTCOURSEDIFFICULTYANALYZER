CREATE DATABASE IF NOT EXISTS scda_db;
USE scda_db;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('Admin', 'Teacher', 'Student') NOT NULL
);

-- Subjects Table
CREATE TABLE IF NOT EXISTS subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject_code VARCHAR(20),
    rating INT CHECK (rating BETWEEN 1 AND 5),
    marks INT CHECK (marks BETWEEN 0 AND 100),
    feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_code) REFERENCES subjects(code) ON DELETE CASCADE
);

-- Materials Table
CREATE TABLE IF NOT EXISTS materials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject_code VARCHAR(20),
    title VARCHAR(255) NOT NULL,
    uploaded_by VARCHAR(100),
    viewed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_code) REFERENCES subjects(code) ON DELETE CASCADE
);

-- Material Ratings Table
CREATE TABLE IF NOT EXISTS material_ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    material_id INT,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE CASCADE
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(50) DEFAULT 'feedback',
    subject_name VARCHAR(100),
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert Mock Data
INSERT IGNORE INTO users (username, password, role) VALUES 
('teacher', 'teacher123', 'Teacher'),
('student', 'student123', 'Student');

INSERT IGNORE INTO subjects (code, name) VALUES 
('CS101', 'Intro to Programming'),
('CS102', 'Data Structures'),
('CS201', 'Database Systems');

INSERT IGNORE INTO reviews (subject_code, rating, marks, feedback) VALUES 
('CS101', 2, 85, 'Basics were clear.'),
('CS101', 3, 75, 'A bit fast-paced.'),
('CS102', 4, 60, 'Very challenging concepts.'),
('CS201', 3, 78, 'Interesting labs.');

INSERT IGNORE INTO materials (subject_code, title, uploaded_by) VALUES 
('CS101', 'Lecture 1: Introduction to Variables', 'Prof. Smith'),
('CS101', 'Lecture 2: Control Flow & Loops', 'Prof. Smith'),
('CS102', 'Arrays and Linked Lists Overview', 'Dr. Johnson'),
('CS201', 'SQL Basics and Normalization', 'Ms. Davis');
