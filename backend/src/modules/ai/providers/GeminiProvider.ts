import { AIProvider, AICompletionOptions, AIChatMessage } from './AIProvider';

export class GeminiProvider implements AIProvider {
  private apiKey: string;
  private defaultModel = 'gemini-1.5-pro';

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
  }

  initialize(): void {
    if (!this.apiKey) {
      console.warn('Gemini API key is missing.');
    }
  }

  async generateCompletion(prompt: string, options?: AICompletionOptions): Promise<string> {
    // In a real implementation, we would use the @google/genai SDK here.
    // For now, we mock the response or perform a direct REST API call.
    console.log(
      `[GeminiProvider] Generating completion using model ${options?.model || this.defaultModel}`,
    );

    // Mocked AI Response
    return `[Mock Gemini Response] Based on the context: "${prompt.substring(0, 50)}...", here is the generated output.`;
  }

  async chat(messages: AIChatMessage[], _options?: AICompletionOptions): Promise<string> {
    console.log(`[GeminiProvider] Chat session with ${messages.length} messages.`);
    const lastMessage = messages[messages.length - 1];

    // Mocked Chat Response
    return `I am the Gemini AI Assistant. You said: "${lastMessage.content}". How can I help you further?`;
  }

  getProviderName(): string {
    return 'GEMINI';
  }
}
