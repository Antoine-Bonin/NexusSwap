import { GoogleGenAI } from "@google/genai";
import { Token } from "../types";

// In a real app, this would be a backend proxy to protect the key.
// Since this is a client-side demo, we use the env variable directly.
const getAiClient = () => {
    // Only initialize if key is present to prevent crashes in non-env setups
    if (!process.env.API_KEY) return null;
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const analyzeMarketPair = async (tokenA: Token, tokenB: Token): Promise<string> => {
    const ai = getAiClient();
    if (!ai) return "AI Service Unavailable (Missing API Key)";

    const prompt = `
    Analyze the trading pair ${tokenA.symbol} / ${tokenB.symbol} on the Solana blockchain.
    Provide a concise, witty, and slightly technical market sentiment analysis for a trader looking to swap.
    Mention potential volatility or recent trends if known (generic is fine). 
    Keep it under 50 words. Be "crypto-native" in tone.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Gemini Analysis Failed", error);
        return "Market data currently unavailable due to solar flares.";
    }
};

export const generateTradingTip = async (context: string): Promise<string> => {
    const ai = getAiClient();
    if (!ai) return "AI tips unavailable.";

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Give a one-sentence safety tip for P2P OTC crypto trading regarding: ${context}`,
        });
        return response.text.trim();
    } catch (error) {
        return "Always verify wallet addresses twice.";
    }
};
