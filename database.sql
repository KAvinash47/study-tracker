-- SQL Script for METRICSTUDY Single-User Database Setup

-- 1. Create TODOS table (Client-provided BigInt IDs)
CREATE TABLE IF NOT EXISTS todos (
    id BIGINT PRIMARY KEY,
    text TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Create TARGETS table (Auto-incrementing serial IDs)
CREATE TABLE IF NOT EXISTS targets (
    id SERIAL PRIMARY KEY,
    day VARCHAR(20) NOT NULL,
    target_hours REAL DEFAULT 0,
    actual_hours REAL DEFAULT 0
);

-- 3. Create SYLLABUS table (Auto-incrementing serial IDs)
CREATE TABLE IF NOT EXISTS syllabus (
    id SERIAL PRIMARY KEY,
    subject VARCHAR(100) NOT NULL,
    chapter VARCHAR(200) NOT NULL,
    status VARCHAR(50) DEFAULT 'not-started',
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. Create MISTAKES table (Client-provided BigInt IDs)
CREATE TABLE IF NOT EXISTS mistakes (
    id BIGINT PRIMARY KEY,
    question TEXT NOT NULL,
    reason VARCHAR(100),
    concept VARCHAR(100),
    revision_date DATE,
    done BOOLEAN DEFAULT FALSE
);

-- 5. Create PYQS table (Client-provided BigInt IDs)
CREATE TABLE IF NOT EXISTS pyqs (
    id BIGINT PRIMARY KEY,
    subject VARCHAR(100) NOT NULL,
    topic VARCHAR(200) NOT NULL,
    difficulty VARCHAR(20),
    year VARCHAR(10),
    attempt VARCHAR(50),
    analysis TEXT
);

-- 6. Create LOGS table (Log date is PK)
CREATE TABLE IF NOT EXISTS logs (
    log_date DATE PRIMARY KEY,
    studied BOOLEAN DEFAULT FALSE,
    hours REAL DEFAULT 0,
    energy VARCHAR(20),
    reason VARCHAR(200),
    topics TEXT,
    notes TEXT
);

-- 7. Create SPACED REVIEWS table (Client-provided string IDs)
CREATE TABLE IF NOT EXISTS spaced_reviews (
    id VARCHAR(100) PRIMARY KEY,
    chapter VARCHAR(200) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    scheduled_date DATE,
    completed BOOLEAN DEFAULT FALSE
);
