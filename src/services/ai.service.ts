import { Relative } from '@/types/relative';
import { CongratulationsStyle } from '@/types/congratulations';
import { congratulationsService } from '@/services/congratulations.service';

/**
 * Local template-based AI features (no external API).
 * Ready to swap congratulationsService for OpenAI later.
 */
export type AiFeature = 'greeting' | 'family-tree' | 'memory-summary';

export type AiRequestContext = {
  relatives: Relative[];
  locale?: 'ru' | 'kz' | 'mixed';
};

export const aiService = {
  async isAvailable(): Promise<boolean> {
    return true;
  },

  async generateBirthdayGreeting(
    relative: Relative,
    style: CongratulationsStyle = 'warm-family',
    seed = Date.now(),
  ): Promise<string> {
    const input = congratulationsService.buildInputFromRelative(relative, null);
    return congratulationsService.generate(style, input, seed);
  },

  async generateGreeting(relativeId: string, context: AiRequestContext): Promise<string> {
    const relative = context.relatives.find((item) => item.id === relativeId);
    if (!relative) {
      throw new Error('Relative not found for greeting.');
    }

    return this.generateBirthdayGreeting(relative);
  },

  async suggestFamilyConnections(_context: AiRequestContext): Promise<string[]> {
    throw new Error('AI family tree suggestions are not available yet.');
  },

  async summarizeMemory(_text: string): Promise<string> {
    throw new Error('AI memory summarization is not available yet.');
  },
};
