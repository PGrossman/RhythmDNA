"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require('fs');
const path = require('path');
const { createReadStream } = require('fs');
const { createInterface } = require('readline');
class JsonlDatabase {
    constructor() {
        this.dbPath = '/Users/grossph/Documents/RhythmDNA';
        this.audioFilesPath = path.join(this.dbPath, 'audio_files.jsonl');
        this.analysisResultsPath = path.join(this.dbPath, 'analysis_results.jsonl');
        this.searchCriteriaPath = path.join(this.dbPath, 'search_criteria.jsonl');
        this.initialize();
    }
    initialize() {
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
    notifyDbCreation(filesCreated) {
        console.log(`Database initialization complete. ${filesCreated} files created.`);
    }
    generateId() {
        return Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9);
    }
    // Audio Files operations
    async insertAudioFile(record) {
        const id = this.generateId();
        const timestamp = new Date().toISOString();
        const fullRecord = {
            id,
            ...record,
            created_at: timestamp,
            updated_at: timestamp
        };
        await fs.promises.appendFile(this.audioFilesPath, JSON.stringify(fullRecord) + '\n');
        return id;
    }
    async getAudioFileByPath(filePath) {
        const fileStream = createReadStream(this.audioFilesPath);
        const rl = createInterface({ input: fileStream, crlfDelay: Infinity });
        for await (const line of rl) {
            if (line.trim()) {
                const record = JSON.parse(line);
                if (record.file_path === filePath) {
                    return record;
                }
            }
        }
        return null;
    }
    async getAllAudioFiles() {
        const records = [];
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
    async insertAnalysisResult(record) {
        const id = this.generateId();
        const timestamp = new Date().toISOString();
        const fullRecord = {
            id,
            ...record,
            created_at: timestamp
        };
        await fs.promises.appendFile(this.analysisResultsPath, JSON.stringify(fullRecord) + '\n');
        return id;
    }
    async getAnalysisResultsByAudioFile(audioFileId) {
        const records = [];
        const fileStream = createReadStream(this.analysisResultsPath);
        const rl = createInterface({ input: fileStream, crlfDelay: Infinity });
        for await (const line of rl) {
            if (line.trim()) {
                const record = JSON.parse(line);
                if (record.audio_file_id === audioFileId) {
                    records.push(record);
                }
            }
        }
        return records;
    }
    // Search Criteria operations
    async insertSearchCriterion(record) {
        const id = this.generateId();
        const timestamp = new Date().toISOString();
        const fullRecord = {
            id,
            ...record,
            created_at: timestamp
        };
        await fs.promises.appendFile(this.searchCriteriaPath, JSON.stringify(fullRecord) + '\n');
        return id;
    }
    async updateSearchCriteria() {
        // Read all analysis results
        const analysisResults = [];
        const fileStream = createReadStream(this.analysisResultsPath);
        const rl = createInterface({ input: fileStream, crlfDelay: Infinity });
        for await (const line of rl) {
            if (line.trim()) {
                analysisResults.push(JSON.parse(line));
            }
        }
        // Extract unique criteria
        const criteriaMap = new Map();
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
                        else {
                            const existing = criteriaMap.get(criterionKey);
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
    getDbStatus() {
        const filesExist = [this.audioFilesPath, this.analysisResultsPath, this.searchCriteriaPath]
            .every(filePath => fs.existsSync(filePath));
        return {
            path: this.dbPath,
            filesExist
        };
    }
}
module.exports = { JsonlDatabase };
