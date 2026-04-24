import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * CrisisService 2.0 with Gemini 1.5 Flash (Free Tier)
 * Supports Multi-modal analysis (Text + Image)
 */

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "PLACEHOLDER_KEY";

export const AIValidationService = {
  /**
   * Analyzes a report using Gemini 1.5 Flash.
   * @param {string} text - User's report description
   * @param {string} base64Image - Optional image data in base64 format
   */
  analyzeReport: async (text, base64Image = null) => {
    try {
      if (!API_KEY || API_KEY === "PLACEHOLDER_KEY") {
        console.warn("Gemini API Key missing - falling back to simulation.");
        return AIValidationService.runMockAnalysis(text);
      }

      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `
        You are a Water Crisis Intelligence AI. 
        Analyze the following user report and image (if provided).
        
        CRITERIA:
        - water_level: 0 (bone dry) to 100 (full/overflowing).
        - priority: "CRITICAL" (Hospital/School/Major leak), "HIGH" (Total shortage), "MEDIUM" (Low pressure), "LOW" (General query).
        - is_real: Detect if this is a prank, unrelated image, or fake report.
        - confidence: 0-100 score of your analysis certainty.
        - reason: A concise 1-sentence explanation of your findings.
        - needs_tanker: boolean (true if emergency water is needed).

        Return ONLY a raw JSON object.
        User Report: "${text}"
      `;

      const parts = [{ text: prompt }];
      
      if (base64Image) {
        parts.push({
          inlineData: {
            data: base64Image.split(",")[1] || base64Image,
            mimeType: "image/jpeg"
          }
        });
      }

      const result = await model.generateContent(parts);
      const response = await result.response;
      const responseText = response.text();
      
      // Clean JSON extraction
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Invalid AI response format");
      
      return JSON.parse(jsonMatch[0]);

    } catch (error) {
      console.error("Gemini AI Error:", error);
      return AIValidationService.runMockAnalysis(text);
    }
  },

  runMockAnalysis: async (input) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const text = input.toLowerCase();
        let water_level = 50; 
        let priority = 'LOW';
        let is_real = true;
        let confidence = 70;
        let reason = 'Simulation: Analyzed report using local heuristic fallback.';

        if (text.includes('hospital') || text.includes('critical')) {
          priority = 'CRITICAL';
          water_level = 10;
        } else if (text.includes('no water') || text.includes('dry')) {
          water_level = 0;
          priority = 'HIGH';
        }
        
        resolve({ water_level, priority, is_real, confidence, reason, needs_tanker: water_level < 20 });
      }, 1000);
    });
  }
};
