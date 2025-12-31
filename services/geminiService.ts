
import { GoogleGenAI } from "@google/genai";
import { StationData } from "../types";

export const getAIInsights = async (data: StationData) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const fuelRevenue = data.shifts.reduce((acc, s) => acc + s.totalAmount, 0);
  const shopRevenue = data.sales.reduce((acc, s) => acc + s.totalPrice, 0);
  const totalExpenses = data.expenses.reduce((acc, e) => acc + e.amount, 0);
  const lowStockProducts = data.products.filter(p => p.stock <= p.minStock).map(p => p.name).join(', ');
  
  const prompt = `
    Analysez la performance de la station-service suivante et fournissez 3 recommandations stratégiques clés en français.
    - Revenu Carburant: ${Math.round(fuelRevenue).toLocaleString()} FCFA
    - Revenu Boutique: ${Math.round(shopRevenue).toLocaleString()} FCFA
    - Dépenses Totales: ${Math.round(totalExpenses).toLocaleString()} FCFA
    - Stock Bas: ${lowStockProducts || 'Aucun'}
    - Cuves: ${data.tanks.map(t => `${t.fuelType}: ${t.currentLevel}/${t.capacity}L`).join(', ')}
    
    Gardez un ton professionnel et expert.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("AI Insights Error:", error);
    return "Une erreur est survenue lors de la génération des recommandations.";
  }
};
