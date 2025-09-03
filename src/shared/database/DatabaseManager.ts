import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { app } from 'electron';

export class DatabaseManager {
    private mainDb: Database.Database;
    private searchDb: Database.Database;
    private dbPath: string;
    
    constructor() {
        // Use hardcoded path as requested
        this.dbPath = '/Users/grossph/Documents/RhythmDNA';
        this.ensureDirectoryExists();
        this.initializeDatabases();
    }
    
    private ensureDirectoryExists(): void {
        if (!fs.existsSync(this.dbPath)) {
            fs.mkdirSync(this.dbPath, { recursive: true });
            console.log(`Created RhythmDNA directory at: ${this.dbPath}`);
        }
    }
    
    private initializeDatabases(): void {
        const mainDbPath = path.join(this.dbPath, 'rhythm_main.db');
        const searchDbPath = path.join(this.dbPath, 'rhythm_search.db');
        
        const mainDbExists = fs.existsSync(mainDbPath);
        const searchDbExists = fs.existsSync(searchDbPath);
        
        this.mainDb = new Database(mainDbPath);
        this.searchDb = new Database(searchDbPath);
        
        // Initialize schemas
        this.initializeMainDbSchema();
        this.initializeSearchDbSchema();
        
        if (!mainDbExists || !searchDbExists) {
            console.log('Database files created successfully');
            // Send message to renderer process about DB creation
            this.notifyDbCreation(!mainDbExists, !searchDbExists);
        }
    }
    
    private initializeMainDbSchema(): void {
        this.mainDb.exec(`
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
                result_data TEXT,
                confidence_score REAL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);
    }
    
    private initializeSearchDbSchema(): void {
        this.searchDb.exec(`
            CREATE TABLE IF NOT EXISTS search_criteria (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                criterion_type TEXT NOT NULL,
                criterion_value TEXT NOT NULL,
                usage_count INTEGER DEFAULT 0,
                last_used DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);
    }
    
    private notifyDbCreation(mainDbCreated: boolean, searchDbCreated: boolean): void {
        // This will be used to notify the renderer process
        const message = `Database initialization complete. ${mainDbCreated ? 'Main DB created. ' : ''}${searchDbCreated ? 'Search DB created.' : ''}`;
        console.log(message);
    }
    
    getMainDb(): Database.Database {
        return this.mainDb;
    }
    
    getSearchDb(): Database.Database {
        return this.searchDb;
    }
    
    updateSearchCriteria(): void {
        // Extract unique criteria from main database
        const criteria = this.mainDb.prepare(`
            SELECT DISTINCT analysis_type, result_data 
            FROM analysis_results 
            WHERE result_data IS NOT NULL
        `).all();
        
        // Process and update search database
        const insertCriteria = this.searchDb.prepare(`
            INSERT OR IGNORE INTO search_criteria (criterion_type, criterion_value) 
            VALUES (?, ?)
        `);
        
        criteria.forEach((item: any) => {
            try {
                const data = JSON.parse(item.result_data);
                // Extract searchable criteria from the analysis data
                Object.keys(data).forEach(key => {
                    if (data[key] && typeof data[key] === 'string') {
                        insertCriteria.run(item.analysis_type + '_' + key, data[key]);
                    }
                });
            } catch (e) {
                console.error('Error parsing result data:', e);
            }
        });
    }
    
    close(): void {
        this.mainDb.close();
        this.searchDb.close();
    }
}
