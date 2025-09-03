export class OllamaClient {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:11434') {
    this.baseUrl = baseUrl;
  }

  async query(prompt: string, model: string = 'llama2'): Promise<string> {
    // Ollama client implementation will go here
    return 'Ollama response placeholder';
  }
}
