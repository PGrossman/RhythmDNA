import fs from 'fs';
import path from 'path';
import { createReadStream } from 'fs';
import { createInterface } from 'readline';

export interface AudioFileRecord {
    id: string;
    file_path: string;
    file_name: string;
    file_size: number;
    duration: number;
    sample_rate: number;
    bit_rate: number;
    channels: number;
    format: string;
    created_at: string;
    updated_at: string;
}

export interface AnalysisRecord {
    id: string;
    audio_file_id: string;
    analysis_type: string;
    result_data: any;
    confidence_score: number;
    created_at: string;
}

export interface SearchCriterion {
    id: string;
    criterion_type: string;
    criterion_value: string;
    usage_count: number;
    last_used: string;
    created_at: string;
}

export class JsonlDatabase {
    private dbPath: string;
    private audioFilesPath: string;
    private analysisResultsPath: string;
    private searchCriteriaPath: string;

    constructor() {
        this.dbPath = '/Users/grossph/Documents/RhythmDNA';
        this.audioFilesPath = path.join(this.dbPath, 'audio_files.jsonl');
        this.analysisResultsPath = path.join(this.dbPath, 'analysis_results.jsonl');
        this.searchCriteriaPath = path.join(this.dbPath, 'search_criteria.jsonl');
        
        this.initialize();
    }

    private initialize(): void {
        // Create directory if it doesn't exist
        if (!fs.existsSync(this.dbPath)) {
            fs.mkdirSync(this.dbPath, { recursive: true });
            console.log(`Created RhythmDNA directory at: ${this.dbPath}`);
        }

        // Create JSONL files if they don't exist
        const files = [this.audioFilesPath, this.analysisResultsPath, this.searchCriteriaPath];
        let filesCreated = 0;
        
        files.forEach(filePath => {
            if (!fs.existsSync(filePath)) {
                fs.writeFileSync(filePath, '');
                filesCreated++;
            }
        });

        if (filesCreated > 0) {
            console.log(`Created ${filesCreated} JSONL database files`);
            this.notifyDbCreation(filesCreated);
        }
    }

    private notifyDbCreation(filesCreated: number): void {
        console.log(`Database initialization complete. ${filesCreated} files created.`);
    }

    private generateId(): string {
        return Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9);
    }

    // Audio Files operations
    async insertAudioFile(record: Omit<AudioFileRecord, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
        const id = this.generateId();
        const timestamp = new Date().toISOString();
        
        const fullRecord: AudioFileRecord = {
            id,
            ...record,
            created_at: timestamp,
            updated_at: timestamp
        };

        await fs.promises.appendFile(this.audioFilesPath, JSON.stringify(fullRecord) + '\n');
        return id;
    }

    async getAudioFileByPath(filePath: string): Promise<AudioFileRecord | null> {
        const fileStream = createReadStream(this.audioFilesPath);
        const rl = createInterface({ input: fileStream, crlfDelay: Infinity });

        for await (const line of rl) {
            if (line.trim()) {
                const record: AudioFileRecord = JSON.parse(line);
                if (record.file_path === filePath) {
                    return record;
                }
            }
        }
        return null;
    }

    async getAllAudioFiles(): Promise<AudioFileRecord[]> {
        const records: AudioFileRecord[] = [];
        const fileStream = createReadStream(this.audioFilesPath);
        const rl = createInterface({ input: fileStream, crlfDelay: Infinity });

        for await (const line of rl) {
            if (line.trim()) {
                records.push(JSON.parse(line));
            }
        }
        return records;
    }

    // Analysis Results operations
    async insertAnalysisResult(record: Omit<AnalysisRecord, 'id' | 'created_at'>): Promise<string> {
        const id = this.generateId();
        const timestamp = new Date().toISOString();
        
        const fullRecord: AnalysisRecord = {
            id,
            ...record,
            created_at: timestamp
        };

        await fs.promises.appendFile(this.analysisResultsPath, JSON.stringify(fullRecord) + '\n');
        return id;
    }

    async getAnalysisResultsByAudioFile(audioFileId: string): Promise<AnalysisRecord[]> {
        const records: AnalysisRecord[] = [];
        const fileStream = createReadStream(this.analysisResultsPath);
        const rl = createInterface({ input: fileStream, crlfDelay: Infinity });

        for await (const line of rl) {
            if (line.trim()) {
                const record: AnalysisRecord = JSON.parse(line);
                if (record.audio_file_id === audioFileId) {
                    records.push(record);
                }
            }
        }
        return records;
    }

    // Search Criteria operations
    async insertSearchCriterion(record: Omit<SearchCriterion, 'id' | 'created_at'>): Promise<string> {
        const id = this.generateId();
        const timestamp = new Date().toISOString();
        
        const fullRecord: SearchCriterion = {
            id,
            ...record,
            created_at: timestamp
        };

        await fs.promises.appendFile(this.searchCriteriaPath, JSON.stringify(fullRecord) + '\n');
        return id;
    }

    async updateSearchCriteria(): Promise<void> {
        // Read all analysis results
        const analysisResults: AnalysisRecord[] = [];
        const fileStream = createReadStream(this.analysisResultsPath);
        const rl = createInterface({ input: fileStream, crlfDelay: Infinity });

        for await (const line of rl) {
            if (line.trim()) {
                analysisResults.push(JSON.parse(line));
            }
        }

        // Extract unique criteria
        const criteriaMap = new Map<string, SearchCriterion>();

        analysisResults.forEach(result => {
            if (result.result_data && typeof result.result_data === 'object') {
                Object.keys(result.result_data).forEach(key => {
                    const value = result.result_data[key];
                    if (value && typeof value === 'string') {
                        const criterionKey = `${result.analysis_type}_${key}_${value}`;
                        const criterionType = `${result.analysis_type}_${key}`;
                        
                        if (!criteriaMap.has(criterionKey)) {
                            criteriaMap.set(criterionKey, {
                                id: this.generateId(),
                                criterion_type: criterionType,
                                criterion_value: value,
                                usage_count: 1,
                                last_used: new Date().toISOString(),
                                created_at: new Date().toISOString()
                            });
                        } else {
                            const existing = criteriaMap.get(criterionKey)!;
                            existing.usage_count++;
                            existing.last_used = new Date().toISOString();
                        }
                    }
                });
            }
        });

        // Write new search criteria (append only - could be optimized later)
        for (const criterion of criteriaMap.values()) {
            await fs.promises.appendFile(this.searchCriteriaPath, JSON.stringify(criterion) + '\n');
        }
    }

    getDbStatus(): { path: string; filesExist: boolean } {
        const filesExist = [this.audioFilesPath, this.analysisResultsPath, this.searchCriteriaPath]
            .every(filePath => fs.existsSync(filePath));

        return {
            path: this.dbPath,
            filesExist
        };
    }
}
