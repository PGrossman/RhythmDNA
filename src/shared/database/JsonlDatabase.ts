const fs = require('fs');
const path = require('path');
const { createReadStream } = require('fs');
const { createInterface } = require('readline');

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
        let directoryCreated = false;
        let filesCreated = 0;

        // Create directory if it doesn't exist
        if (!fs.existsSync(this.dbPath)) {
            fs.mkdirSync(this.dbPath, { recursive: true });
            console.log(`Created RhythmDNA directory at: ${this.dbPath}`);
            directoryCreated = true;
        }

        // Create JSONL files if they don't exist
        const files = [
            { path: this.audioFilesPath, name: 'audio_files.jsonl' },
            { path: this.analysisResultsPath, name: 'analysis_results.jsonl' },
            { path: this.searchCriteriaPath, name: 'search_criteria.jsonl' }
        ];
        
        files.forEach(file => {
            if (!fs.existsSync(file.path)) {
                fs.writeFileSync(file.path, '');
                console.log(`Created ${file.name}`);
                filesCreated++;
            }
        });

        if (directoryCreated || filesCreated > 0) {
            this.notifyDbCreation(directoryCreated, filesCreated);
        }
    }

    private notifyDbCreation(directoryCreated: boolean, filesCreated: number): void {
        let message = 'Database initialization complete. ';
        if (directoryCreated) {
            message += 'RhythmDNA folder created. ';
        }
        if (filesCreated > 0) {
            message += `${filesCreated} database files created.`;
        }
        console.log(message);
        
        // This will be sent to the renderer process
        this.creationMessage = message;
    }

    private creationMessage: string = '';

    private generateId(): string {
        return Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9);
    }

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

    async getAllAudioFiles(): Promise<AudioFileRecord[]> {
        const records: AudioFileRecord[] = [];
        
        if (!fs.existsSync(this.audioFilesPath)) {
            return records;
        }

        const fileStream = createReadStream(this.audioFilesPath);
        const rl = createInterface({ input: fileStream, crlfDelay: Infinity });

        for await (const line of rl) {
            if (line.trim()) {
                try {
                    records.push(JSON.parse(line));
                } catch (error) {
                    console.error('Error parsing line:', line, error);
                }
            }
        }
        return records;
    }

    async updateSearchCriteria(): Promise<void> {
        const analysisResults: AnalysisRecord[] = [];
        
        if (!fs.existsSync(this.analysisResultsPath)) {
            return;
        }

        const fileStream = createReadStream(this.analysisResultsPath);
        const rl = createInterface({ input: fileStream, crlfDelay: Infinity });

        for await (const line of rl) {
            if (line.trim()) {
                try {
                    analysisResults.push(JSON.parse(line));
                } catch (error) {
                    console.error('Error parsing analysis result:', error);
                }
            }
        }

        // Extract unique criteria and append to search criteria file
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
                        }
                    }
                });
            }
        });

        // Append new criteria to file
        for (const criterion of criteriaMap.values()) {
            await fs.promises.appendFile(this.searchCriteriaPath, JSON.stringify(criterion) + '\n');
        }
    }

    getDbStatus(): { path: string; filesExist: boolean; creationMessage?: string } {
        const filesExist = [this.audioFilesPath, this.analysisResultsPath, this.searchCriteriaPath]
            .every(filePath => fs.existsSync(filePath));

        const result: any = {
            path: this.dbPath,
            filesExist
        };

        if (this.creationMessage) {
            result.creationMessage = this.creationMessage;
            this.creationMessage = ''; // Clear after sending
        }

        return result;
    }
}

// CommonJS export for compatibility
module.exports = { JsonlDatabase };