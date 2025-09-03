-- Main analysis database schema
CREATE TABLE IF NOT EXISTS audio_files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_path TEXT UNIQUE NOT NULL,
    file_name TEXT NOT NULL,
    file_size INTEGER,
    duration REAL,
    sample_rate INTEGER,
    bit_rate INTEGER,
    channels INTEGER,
    format TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS analysis_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    audio_file_id INTEGER REFERENCES audio_files(id),
    analysis_type TEXT NOT NULL,
    result_data TEXT, -- JSON data
    confidence_score REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Search criteria database schema
CREATE TABLE IF NOT EXISTS search_criteria (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    criterion_type TEXT NOT NULL, -- genre, tempo, key, etc.
    criterion_value TEXT NOT NULL,
    usage_count INTEGER DEFAULT 0,
    last_used DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
