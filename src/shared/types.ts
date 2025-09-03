// Shared TypeScript types for RhythmDNA

export interface AudioMetadata {
  duration: number;
  sampleRate: number;
  channels: number;
  bitrate: number;
  format: string;
  codec?: string;
  size?: number;
}

export interface AudioAnalysis {
  metadata: AudioMetadata;
  features: AudioFeatures;
  rhythm: RhythmAnalysis;
  harmony: HarmonyAnalysis;
  melody: MelodyAnalysis;
}

export interface AudioFeatures {
  tempo: number;
  key: string;
  mode: string;
  energy: number;
  valence: number;
  danceability: number;
}

export interface RhythmAnalysis {
  bpm: number;
  timeSignature: string;
  rhythmPattern: number[];
  groove: number;
}

export interface HarmonyAnalysis {
  chordProgression: string[];
  keySignature: string;
  harmonicComplexity: number;
}

export interface MelodyAnalysis {
  pitchRange: number;
  melodicContour: number[];
  tonality: string;
}

export interface OllamaResponse {
  response: string;
  model: string;
  done: boolean;
}

export interface AppSettings {
  ollamaUrl: string;
  defaultModel: string;
  audioFormats: string[];
  analysisDepth: 'basic' | 'detailed' | 'comprehensive';
}

declare global {
  interface Window {
    electronAPI: {
      updateSearchCriteria: () => Promise<{success: boolean, message: string}>;
      getDbStatus: () => Promise<{path: string, mainDbConnected: boolean, searchDbConnected: boolean}>;
      onDbStatus: (callback: (status: any) => void) => void;
      // Other APIs will be added later
      analyzeAudio: (filePath: string) => Promise<any>;
      queryOllama: (prompt: string, model?: string) => Promise<any>;
      selectAudioFile: () => Promise<any>;
      getSettings: () => Promise<any>;
      saveSettings: (settings: any) => Promise<any>;
    }
  }
}

export {};
