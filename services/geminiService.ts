
import { GoogleGenAI, Type } from "@google/genai";
import { FoodItem, Recipe, UserProfile, ExpiryStatus } from "../types";
import { CATEGORIES } from "../constants";

// Strictly use process.env.API_KEY as per instructions
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateFoodImage = async (itemName: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `A high-quality, professional food photography shot of ${itemName} on a clean, minimalist background. Studio lighting, realistic textures.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image generation failed:", error);
    return null;
  }
};

export const getWasteInsight = async (inventory: FoodItem[]): Promise<string> => {
  const expiringCount = inventory.filter(i => i.status === ExpiryStatus.EXPIRING_SOON).length;
  const expiredCount = inventory.filter(i => i.status === ExpiryStatus.EXPIRED).length;
  const topCategories = inventory.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const prompt = `
    Analyze this pantry data:
    - Items Expiring Soon: ${expiringCount}
    - Currently Expired Items: ${expiredCount}
    - Top Categories: ${JSON.stringify(topCategories)}

    Provide a short (2-3 sentences), encouraging, and professional insight on how to reduce waste and save more money this month. Focus on the category with the most items if applicable.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text || "Keep tracking your items to get personalized waste reduction insights!";
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return "Start using your expiring items today to save on grocery bills!";
  }
};

export const getBudgetInsights = async (inventory: FoodItem[]): Promise<string> => {
  const totalValue = inventory.reduce((sum, item) => sum + (item.price || 0), 0);
  const wastedValue = inventory
    .filter(i => i.status === ExpiryStatus.EXPIRED)
    .reduce((sum, item) => sum + (item.price || 0), 0);
  
  const categoryWaste = inventory
    .filter(i => i.status === ExpiryStatus.EXPIRED)
    .reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + (item.price || 0);
      return acc;
    }, {} as Record<string, number>);

  const prompt = `
    Analyze this food budget data:
    - Total Inventory Value: $${totalValue.toFixed(2)}
    - Total Wasted Value (Expired): $${wastedValue.toFixed(2)}
    - Waste by Category: ${JSON.stringify(categoryWaste)}

    Provide a professional financial insight on food spending. Tell the user how much they could save by better managing high-waste categories. Keep it to 2 sentences.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text || "Tracking prices helps you identify where your money is being wasted.";
  } catch (error) {
    return "Optimize your shopping by buying less in categories where you frequently let food expire.";
  }
};

export const getRecipeSuggestions = async (inventory: FoodItem[], userProfile: UserProfile): Promise<Recipe[]> => {
  const expiringSoon = inventory.filter(i => i.status === ExpiryStatus.EXPIRING_SOON).map(i => i.name);
  const freshItems = inventory.filter(i => i.status === ExpiryStatus.FRESH).map(i => i.name);
  const allergies = userProfile.allergies.map(a => `${a.name} (${a.severity} severity)`);
  const healthConditions = userProfile.healthConditions || [];
  
  const prompt = `
    ACT AS A PROFESSIONAL CHEF AND NUTRITIONIST.
    
    INVENTORY DATA:
    - HIGH PRIORITY (Expiring Soon): ${expiringSoon.length > 0 ? expiringSoon.join(", ") : "None"}
    - SECONDARY (Fresh): ${freshItems.join(", ")}

    USER PROFILE:
    - ALLERGIES: ${allergies.length > 0 ? allergies.join(", ") : "None"}
    - HEALTH CONDITIONS: ${healthConditions.length > 0 ? healthConditions.join(", ") : "None"}

    TASK:
    Suggest 3 creative and delicious recipes using these items.

    STRICT CONSTRAINTS:
    1. WASTE REDUCTION: You MUST prioritize using items from the "HIGH PRIORITY" list.
    2. SAFETY FIRST: The recipes MUST be 100% safe for the User's Allergies and suitable for their Health Conditions.
    3. SUBSTITUTIONS: If a standard version of a suggested recipe typically contains an allergen or problematic ingredient for their health condition, you MUST suggest a safe substitution in the 'ingredients' list and explain it in the 'allergyNotes' field.
    4. VARIETY: Suggest a range of difficulties and meal types.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              image: { type: Type.STRING, description: "A highly descriptive search term for a professional food photo of this specific dish." },
              prepTime: { type: Type.STRING },
              servings: { type: Type.STRING },
              difficulty: { type: Type.STRING },
              description: { type: Type.STRING },
              rating: { type: Type.NUMBER },
              reviewCount: { type: Type.NUMBER },
              ingredients: { 
                type: Type.ARRAY, 
                items: { 
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    quantity: { type: Type.STRING }
                  },
                  required: ["name", "quantity"]
                } 
              },
              instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
              expiringIngredientsUsed: { type: Type.ARRAY, items: { type: Type.STRING } },
              allergyNotes: { type: Type.STRING, description: "Detailed explanation of safety measures or ingredient substitutions." },
            },
            required: ["id", "title", "prepTime", "servings", "difficulty", "description", "rating", "reviewCount", "ingredients", "instructions", "expiringIngredientsUsed"]
          }
        }
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Gemini Recipe Error:", error);
    return [];
  }
};

export const scanReceipt = async (imageData: string): Promise<Partial<FoodItem>[]> => {
  const prompt = `Analyze this shopping receipt image and extract the list of food items. 
  For each item, extract the price and guess a logical expiry date based on standard shelf life if not visible. 
  Return as a JSON array of objects with 'name', 'category', 'expiryDate' (ISO string), 'quantity', and 'price' (number).`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { text: prompt },
          { inlineData: { mimeType: "image/jpeg", data: imageData.split(',')[1] } }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              category: { type: Type.STRING },
              expiryDate: { type: Type.STRING },
              quantity: { type: Type.STRING },
              price: { type: Type.NUMBER },
            }
          }
        }
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Gemini Scanning Error:", error);
    return [];
  }
};

export const analyzeFoodImage = async (imageData: string): Promise<string> => {
  const prompt = `Act as a professional food safety expert and AI kitchen assistant. 
  Analyze this photo of food/groceries:
  1. Identify all food items visible.
  2. For each item, estimate freshness (1-10) and mention any signs of spoilage (mold, wilting, bruising).
  3. Provide 2-3 specific storage tips to keep these items fresh longer.
  4. If anything looks unsafe to eat, highlight it clearly with a safety warning.
  
  Format the response using Markdown with bold titles and bullet points. Be professional and concise.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: {
        parts: [
          { text: prompt },
          { inlineData: { mimeType: "image/jpeg", data: imageData.split(',')[1] } }
        ]
      },
    });

    return response.text || "I couldn't analyze the food in this image. Please ensure the lighting is good and try again.";
  } catch (error) {
    console.error("Gemini Vision Error:", error);
    return "Analysis service temporarily unavailable. Please try again later.";
  }
};

export const predictCategory = async (itemName: string): Promise<string> => {
  if (!itemName || itemName.length < 2) return "Other";

  const prompt = `Given the food item name "${itemName}", predict the most suitable category from this list: ${CATEGORIES.join(", ")}. 
  Respond ONLY with the category name string.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    const result = response.text?.trim() || "Other";
    return CATEGORIES.includes(result) ? result : "Other";
  } catch (error) {
    console.error("Gemini Prediction Error:", error);
    return "Other";
  }
};
