export interface AICompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export interface AIChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIProvider {
  /**
   * Initialize the AI provider with necessary API keys.
   */
  initialize(): void;

  /**
   * Generate text completion based on a prompt.
   */
  generateCompletion(
    prompt: string,
    options?: AICompletionOptions
  ): Promise<string>;

  /**
   * Conduct a chat session with the AI.
   */
  chat(
    messages: AIChatMessage[],
    options?: AICompletionOptions
  ): Promise<string>;

  /**
   * Retrieve the name of the active provider (e.g., 'GEMINI', 'OPENAI').
   */
  getProviderName(): string;
}
