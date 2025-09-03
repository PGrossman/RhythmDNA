# RhythmDNA

A modular Electron application for audio analysis with FFMPEG and Ollama integration.

## Features

- **Audio Analysis**: Extract rhythm, harmony, and melody features from audio files
- **FFMPEG Integration**: Powerful audio processing capabilities
- **Ollama Integration**: AI-powered audio analysis and insights
- **Modular Architecture**: Clean separation of concerns for easy maintenance
- **Modern UI**: React-based interface with Tailwind CSS

## Project Structure

```
src/
├── main/           # Electron main process
│   ├── main.ts     # Main Electron process
│   └── ffmpeg.ts   # FFMPEG wrapper service
├── preload/        # Secure IPC bridge
│   └── preload.ts  # IPC bridge with context isolation
├── renderer/       # React app
│   ├── main.tsx    # React entry point
│   ├── App.tsx     # Main app component
│   ├── components/ # Reusable UI components
│   │   └── Shell.tsx
│   └── routes/     # Tab components (isolated modules)
│       ├── Analysis.tsx
│       ├── Search.tsx
│       └── Settings.tsx
├── shared/         # Shared types and utilities
│   ├── types.ts    # Shared TypeScript types
│   └── services/   # Service modules
│       ├── audioAnalysis.ts
│       ├── ollamaClient.ts
│       └── fileHandler.ts
└── assets/         # Static assets
```

## Development

### Prerequisites

- Node.js 18+
- FFMPEG installed on your system
- Ollama running locally (optional)

### Installation

```bash
npm install
```

### Development Mode

```bash
npm run electron:dev
```

This will start both the Vite dev server and Electron in development mode.

### Building

```bash
npm run build
```

### Distribution

```bash
npm run electron:dist
```

## Architecture

The application follows a modular architecture with clear separation between:

- **Main Process**: Handles system-level operations, FFMPEG processing, and IPC
- **Renderer Process**: React-based UI with tabbed interface
- **Preload Script**: Secure bridge between main and renderer processes
- **Shared Services**: Reusable business logic and type definitions

## Future Development

The Search functionality is designed as a separate module that can be extracted into its own application in the future, maintaining the modular architecture principle.
