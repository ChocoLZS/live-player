-- 用户表
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 播放器表
CREATE TABLE players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    p_id TEXT UNIQUE NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    cover_url TEXT,
    announcement TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 插入默认管理员用户（密码: admin123）
INSERT INTO users (username, password_hash, role) VALUES 
('admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewoDxHKUO/N8/Ox.', 'admin');

-- 插入示例播放器数据
INSERT INTO players (name, p_id, description, url, announcement) VALUES 
('示例直播间', 'demo-stream', '这是一个示例直播间', 'https://example.com/stream.m3u8', '欢迎观看直播！');