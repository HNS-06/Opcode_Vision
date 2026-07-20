-- SQLite Schema for OpcodeVision

CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description TEXT
);

CREATE TABLE IF NOT EXISTS files (
    id TEXT PRIMARY KEY,
    project_id TEXT,
    filename TEXT NOT NULL,
    file_path TEXT,
    file_size INTEGER NOT NULL,
    file_type TEXT NOT NULL, -- PE, ELF, BIN
    arch TEXT,
    bits INTEGER,
    entry_point INTEGER,
    md5 TEXT,
    sha256 TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_id TEXT NOT NULL,
    name TEXT NOT NULL,
    virtual_address INTEGER,
    virtual_size INTEGER,
    raw_size INTEGER,
    entropy REAL,
    permissions TEXT,
    FOREIGN KEY(file_id) REFERENCES files(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS functions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_id TEXT NOT NULL,
    name TEXT NOT NULL,
    address INTEGER NOT NULL,
    size INTEGER,
    basic_block_count INTEGER DEFAULT 0,
    cyclomatic_complexity INTEGER DEFAULT 1,
    instruction_count INTEGER DEFAULT 0,
    calls TEXT, -- JSON array of called addresses
    FOREIGN KEY(file_id) REFERENCES files(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS opcodes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_id TEXT NOT NULL,
    mnemonic TEXT NOT NULL,
    category TEXT,
    frequency INTEGER NOT NULL,
    percentage REAL,
    FOREIGN KEY(file_id) REFERENCES files(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS imports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_id TEXT NOT NULL,
    library TEXT NOT NULL,
    function_name TEXT NOT NULL,
    category TEXT, -- Network, Crypto, Memory, Process, Registry, File, Other
    FOREIGN KEY(file_id) REFERENCES files(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS entropy_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_id TEXT NOT NULL,
    overall_entropy REAL NOT NULL,
    sliding_window_data TEXT, -- JSON array of {offset, entropy}
    FOREIGN KEY(file_id) REFERENCES files(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS statistics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_id TEXT NOT NULL,
    total_instructions INTEGER,
    unique_instructions INTEGER,
    instruction_density REAL,
    avg_function_size REAL,
    code_data_ratio REAL,
    compiler_detected TEXT,
    FOREIGN KEY(file_id) REFERENCES files(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY,
    file_id TEXT NOT NULL,
    format TEXT NOT NULL, -- html, markdown, json, pdf
    report_data TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(file_id) REFERENCES files(id) ON DELETE CASCADE
);
