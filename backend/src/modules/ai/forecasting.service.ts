import { aiService } from './ai.service';

export class ForecastingService {
  public static async predictDemand(branchId: string, daysAhead: number = 7) {
    const prompt = `Predict demand for branch ${branchId} for the next ${daysAhead} days based on historical weather, events, and sales data.`;
    const response = await aiService.generateCompletion(prompt);
    
    // Mock parsing
    return {
      predictionType: 'DEMAND',
      forecasts: [
        { date: new Date().toISOString(), expectedOrders: 145, confidence: 0.89 },
        { date: new Date(Date.now() + 86400000).toISOString(), expectedOrders: 160, confidence: 0.85 }
      ],
      aiAnalysis: response
    };
  }

  public static async predictInventory(branchId: string) {
    const prompt = `Analyze inventory consumption rates for branch ${branchId}. Identify stockout risks for the next 3 days.`;
    const response = await aiService.generateCompletion(prompt);

    return {
      predictionType: 'INVENTORY',
      risks: [
        { ingredient: 'Mozzarella Cheese', daysLeft: 1.2, suggestedRestockQty: 50 },
        { ingredient: 'Pizza Dough', daysLeft: 0.5, suggestedRestockQty: 100 }
      ],
      aiAnalysis: response
    };
  }
}
