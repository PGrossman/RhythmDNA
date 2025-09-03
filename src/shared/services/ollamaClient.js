"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OllamaClient = void 0;
class OllamaClient {
    constructor(_baseUrl = 'http://localhost:11434') {
        // Base URL will be used in future implementation
    }
    async query(_prompt, _model = 'llama2') {
        // Ollama client implementation will go here
        return 'Ollama response placeholder';
    }
}
exports.OllamaClient = OllamaClient;
