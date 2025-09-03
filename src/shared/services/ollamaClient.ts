class OllamaClient {
  constructor(_baseUrl: string = 'http://localhost:11434') {
    // Base URL will be used in future implementation
  }

  async query(_prompt: string, _model: string = 'llama2'): Promise<string> {
    // Ollama client implementation will go here
    return 'Ollama response placeholder';
  }
}

module.exports = { OllamaClient };
