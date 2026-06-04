import { AIProvider, AICompletionOptions, AIChatMessage } from './AIProvider';

export class OpenAIProvider implements AIProvider {
  private apiKey: string;
  private defaultModel = 'gpt-4o';

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
  }

  initialize(): void {
    if (!this.apiKey) {
      console.warn('OpenAI API key is missing.');
    }
  }

  async generateCompletion(prompt: string, options?: AICompletionOptions): Promise<string> {
    // In a real implementation, we would use the openai npm package.
    console.log(`[OpenAIProvider] Generating completion using model ${options?.model || this.defaultModel}`);
    
    // Mocked AI Response
    return `[Mock OpenAI Response] Processing your prompt: "${prompt.substring(0, 50)}...". Result generated successfully.`;
  }

  async chat(messages: AIChatMessage[], _options?: AICompletionOptions): Promise<string> {
    console.log(`[OpenAIProvider] Chat session with ${messages.length} messages.`);
    const lastMessage = messages[messages.length - 1];
    
    // Mocked Chat Response
    return `I am the OpenAI Assistant. You asked: "${lastMessage.content}". What else do you need?`;
  }

  getProviderName(): string {
    return 'OPENAI';
  }
}
