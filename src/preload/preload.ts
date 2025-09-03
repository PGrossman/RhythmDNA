import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // Audio analysis APIs
  analyzeAudio: (filePath: string) => ipcRenderer.invoke('analyze-audio', filePath),
  
  // Ollama integration APIs
  queryOllama: (prompt: string, model?: string) => ipcRenderer.invoke('query-ollama', prompt, model),
  
  // File handling APIs
  selectAudioFile: () => ipcRenderer.invoke('select-audio-file'),
  
  // Settings APIs
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings: any) => ipcRenderer.invoke('save-settings', settings),
});
