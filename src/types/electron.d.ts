// Global type declarations for Electron API

export interface ElectronAPI {
  // Audio analysis APIs
  analyzeAudio: (filePath: string) => Promise<any>;
  
  // Ollama integration APIs
  queryOllama: (prompt: string, model?: string) => Promise<string>;
  
  // File handling APIs
  selectAudioFile: () => Promise<string | null>;
  
  // Settings APIs
  getSettings: () => Promise<any>;
  saveSettings: (settings: any) => Promise<void>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
