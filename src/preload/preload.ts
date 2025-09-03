import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // JSONL Database APIs
  updateSearchCriteria: () => ipcRenderer.invoke('update-search-criteria'),
  getDbStatus: () => ipcRenderer.invoke('get-db-status'),
  insertAudioFile: (record: any) => ipcRenderer.invoke('insert-audio-file', record),
  getAllAudioFiles: () => ipcRenderer.invoke('get-all-audio-files'),
  
  // Listen for DB status updates
  onDbStatus: (callback: (status: any) => void) => {
    ipcRenderer.on('db-status', (_event, status) => callback(status));
  },
  
  // Audio analysis APIs (placeholder)
  analyzeAudio: (filePath: string) => ipcRenderer.invoke('analyze-audio', filePath),
  
  // Ollama integration APIs (placeholder)
  queryOllama: (prompt: string, model?: string) => ipcRenderer.invoke('query-ollama', prompt, model),
  
  // File handling APIs (placeholder)
  selectAudioFile: () => ipcRenderer.invoke('select-audio-file'),
  
  // Settings APIs (placeholder)
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings: any) => ipcRenderer.invoke('save-settings', settings),
});
