// Shared TypeScript types for RhythmDNA

interface AudioMetadata {
  duration: number;
  sampleRate: number;
  channels: number;
  bitrate: number;
  format: string;
  codec?: string;
  size?: number;
}

interface AudioAnalysis {
  metadata: AudioMetadata;
  features: AudioFeatures;
  rhythm: RhythmAnalysis;
  harmony: HarmonyAnalysis;
  melody: MelodyAnalysis;
}

interface AudioFeatures {
  tempo: number;
  key: string;
  mode: string;
  energy: number;
  valence: number;
  danceability: number;
}

interface RhythmAnalysis {
  bpm: number;
  timeSignature: string;
  rhythmPattern: number[];
  groove: number;
}

interface HarmonyAnalysis {
  chordProgression: string[];
  keySignature: string;
  harmonicComplexity: number;
}

interface MelodyAnalysis {
  pitchRange: number;
  melodicContour: number[];
  tonality: string;
}

interface OllamaResponse {
  response: string;
  model: string;
  done: boolean;
}

interface AppSettings {
  ollamaUrl: string;
  defaultModel: string;
  audioFormats: string[];
  analysisDepth: 'basic' | 'detailed' | 'comprehensive';
}

// For CommonJS, we don't export interfaces as they are compile-time only
// The interfaces are available for TypeScript compilation but not at runtime
