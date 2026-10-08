-- Rektelier DB schema (MySQL 8+)

CREATE TABLE IF NOT EXISTS admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  category_id INT NULL,
  location VARCHAR(255),
  year VARCHAR(10),
  size VARCHAR(100) NULL,
  client VARCHAR(150) NULL,
  build_status VARCHAR(50) NULL,
  description TEXT,
  cover_image VARCHAR(500),
  header_image VARCHAR(255) NULL,
  video_url VARCHAR(500),
  status ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
  submitted_by_name VARCHAR(150),
  submitted_by_email VARCHAR(150),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS project_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  media_type ENUM('image', 'video') NOT NULL DEFAULT 'image',
  sort_order INT DEFAULT 0,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS team_members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  position VARCHAR(150),
  photo_url VARCHAR(500),
  is_former BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS news (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  news_date DATE NULL,
  content TEXT,
  cover_image VARCHAR(255) NULL,
  external_link VARCHAR(500) NULL,
  status ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
  submitted_by_name VARCHAR(150) NOT NULL,
  submitted_by_email VARCHAR(150) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index untuk query yang paling sering dipakai
CREATE INDEX idx_projects_status_sort ON projects (status, sort_order, created_at);
CREATE INDEX idx_news_status_date ON news (status, news_date);

INSERT IGNORE INTO categories (name, slug) VALUES
  ('Residential', 'residential'),
  ('Commercial', 'commercial'),
  ('Competition', 'competition');