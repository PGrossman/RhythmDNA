"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    // JSONL Database APIs
    updateSearchCriteria: () => electron_1.ipcRenderer.invoke('update-search-criteria'),
    getDbStatus: () => electron_1.ipcRenderer.invoke('get-db-status'),
    insertAudioFile: (record) => electron_1.ipcRenderer.invoke('insert-audio-file', record),
    getAllAudioFiles: () => electron_1.ipcRenderer.invoke('get-all-audio-files'),
    // Listen for DB status updates
    onDbStatus: (callback) => {
        electron_1.ipcRenderer.on('db-status', (_event, status) => callback(status));
    },
    // Audio analysis APIs (placeholder)
    analyzeAudio: (filePath) => electron_1.ipcRenderer.invoke('analyze-audio', filePath),
    // Ollama integration APIs (placeholder)
    queryOllama: (prompt, model) => electron_1.ipcRenderer.invoke('query-ollama', prompt, model),
    // File handling APIs (placeholder)
    selectAudioFile: () => electron_1.ipcRenderer.invoke('select-audio-file'),
    // Settings APIs (placeholder)
    getSettings: () => electron_1.ipcRenderer.invoke('get-settings'),
    saveSettings: (settings) => electron_1.ipcRenderer.invoke('save-settings', settings),
});
