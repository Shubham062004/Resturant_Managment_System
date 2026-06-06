import { AIProvider, AICompletionOptions, AIChatMessage } from './providers/AIProvider';
import { GeminiProvider } from './providers/GeminiProvider';
import { OpenAIProvider } from './providers/OpenAIProvider';
import { PromptLog } from '../../database/mongo/PromptLog';
import { ChatLog } from '../../database/mongo/ChatLog';

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
    try {
      await PromptLog.create({
        provider: this.getActiveProviderName(),
        aiModel: this.activeProvider.getProviderName() === 'GEMINI' ? 'gemini-pro' : 'gpt-4',
        promptType: 'COMPLETION',
        promptText: prompt,
        responseText: response,
        latencyMs,
        status,
        errorMessage,
      });
    } catch (err: any) {
      console.error('Failed to log prompt telemetry to MongoDB:', err.message);
    }
  }

  private async logChat(messages: AIChatMessage[], response: string, _latencyMs: number, status: 'SUCCESS' | 'ERROR', _errorMessage?: string) {
    try {
      const sessionId = 'session_' + Math.random().toString(36).substr(2, 9);
      const chatMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: new Date()
      }));
      if (response && status === 'SUCCESS') {
        chatMessages.push({
          role: 'assistant',
          content: response,
          timestamp: new Date()
        });
      }
      await ChatLog.create({
        sessionId,
        messages: chatMessages,
        resolved: status === 'SUCCESS',
      });
    } catch (err: any) {
      console.error('Failed to log chat telemetry to MongoDB:', err.message);
    }
  }
}

export const aiService = new AIService();
