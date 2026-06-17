import { describe, it, expect, vi } from 'vitest';

import { aiService } from './ai.service';
import { GeminiProvider } from './providers/GeminiProvider';

describe('aiService', () => {
  it('should initialize with Gemini as default provider', () => {
    expect(aiService.getActiveProviderName()).toBe('GEMINI');
  });

  it('should switch providers successfully', () => {
    aiService.setActiveProvider('OPENAI');
    expect(aiService.getActiveProviderName()).toBe('OPENAI');

    // Switch back
    aiService.setActiveProvider('GEMINI');
    expect(aiService.getActiveProviderName()).toBe('GEMINI');
  });

  it('should call generateCompletion on active provider', async () => {
    const mockResponse = 'mock response';
    const geminiProvider = (aiService as any).activeProvider as GeminiProvider;
    vi.spyOn(geminiProvider, 'generateCompletion').mockResolvedValue(
      mockResponse
    );

    const res = await aiService.generateCompletion('test prompt');
    expect(res).toBe(mockResponse);
    expect(geminiProvider.generateCompletion).toHaveBeenCalledWith(
      'test prompt',
      undefined
    );
  });
});
