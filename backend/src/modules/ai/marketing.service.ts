import { aiService } from './ai.service';

export class MarketingService {
  public static async generateCampaignIdeas(
    goal: string,
    targetAudience: string
  ) {
    const prompt = `Generate 3 creative marketing campaign ideas for a restaurant. Goal: ${goal}. Audience: ${targetAudience}. Format as JSON.`;
    const response = await aiService.generateCompletion(prompt);

    return {
      goal,
      targetAudience,
      campaigns: [
        {
          title: 'Weekend Family Fiesta',
          description:
            'Offer a 20% discount on family-sized combos every weekend.',
          channels: ['Email', 'SMS'],
        },
        {
          title: 'Lunch Hour Rush',
          description:
            'Promote quick-bite combos between 12 PM and 2 PM to office workers.',
          channels: ['Push Notification'],
        },
      ],
      rawAiResponse: response,
    };
  }

  public static async segmentCustomers(userIds: string[]) {
    // In reality, fetch user data and ask AI to classify.
    return userIds.map((id) => ({
      userId: id,
      segment: 'Frequent Buyer',
      confidence: 0.92,
      traits: ['High AOV', 'Orders on weekends'],
    }));
  }
}
