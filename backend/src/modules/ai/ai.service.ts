import { AIProvider, AICompletionOptions, AIChatMessage } from './providers/AIProvider';
import { GeminiProvider } from './providers/GeminiProvider';
import { OpenAIProvider } from './providers/OpenAIProvider';

export class AIService {
  private activeProvider: AIProvider;
  private geminiProvider: GeminiProvider;
  private openaiProvider: OpenAIProvider;

  constructor() {
    this.geminiProvider = new GeminiProvider();
    this.openaiProvider = new OpenAIProvider();
    
    this.geminiProvider.initialize();
    this.openaiProvider.initialize();

    // Defaulting to Gemini, could be set via env var
    const defaultProvider = process.env.PRIMARY_AI_PROVIDER || 'GEMINI';
    this.activeProvider = defaultProvider === 'OPENAI' ? this.openaiProvider : this.geminiProvider;
  }

  public setActiveProvider(providerName: 'GEMINI' | 'OPENAI') {
    if (providerName === 'GEMINI') {
      this.activeProvider = this.geminiProvider;
    } else {
      this.activeProvider = this.openaiProvider;
    }
  }

  public getActiveProviderName(): string {
    return this.activeProvider.getProviderName();
  }

  public async generateCompletion(prompt: string, options?: AICompletionOptions): Promise<string> {
    const startTime = Date.now();
    try {
      const response = await this.activeProvider.generateCompletion(prompt, options);
      const latency = Date.now() - startTime;
      this.logPrompt(prompt, response, latency, 'SUCCESS');
      return response;
    } catch (error: any) {
      const latency = Date.now() - startTime;
      this.logPrompt(prompt, '', latency, 'ERROR', error.message);
      throw error;
    }
  }

  public async chat(messages: AIChatMessage[], options?: AICompletionOptions): Promise<string> {
    const startTime = Date.now();
    try {
      const response = await this.activeProvider.chat(messages, options);
      const latency = Date.now() - startTime;
      this.logChat(messages, response, latency, 'SUCCESS');
      return response;
    } catch (error: any) {
      const latency = Date.now() - startTime;
      this.logChat(messages, '', latency, 'ERROR', error.message);
      throw error;
    }
  }

  private async logPrompt(prompt: string, response: string, latencyMs: number, status: 'SUCCESS' | 'ERROR', errorMessage?: string) {
    // Ideally log to PromptLog (MongoDB)
    console.log(`[PromptLog] ${status} - Latency: ${latencyMs}ms`);
  }

  private async logChat(messages: AIChatMessage[], response: string, latencyMs: number, status: 'SUCCESS' | 'ERROR', errorMessage?: string) {
    // Ideally log to ChatLog (MongoDB)
    console.log(`[ChatLog] ${status} - Latency: ${latencyMs}ms`);
  }
}

export const aiService = new AIService();
