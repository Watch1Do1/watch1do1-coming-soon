import { GoogleGenAI, Type } from "@google/genai";
import { Product, ProjectInsights, ProjectCategory, Money } from "../types";
import { bigCommerceService } from "./bigCommerceService";

export const PLATFORM_DEFAULT_CAMPID = "5339014523";

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Utility: Converts AI string price to structured Money object
 */
export const asMoney = (priceStr: string | number): Money => {
  if (typeof priceStr === 'number') return { amount: priceStr, currency: 'USD' };
  const cleaned = priceStr.replace(/[^0-9.]/g, '');
  return { amount: parseFloat(cleaned) || 0, currency: 'USD' };
};

const sessionCache = new Map<string, any>();

const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
    return Promise.race([
        promise,
        new Promise<T>((_, reject) => setTimeout(() => reject(new Error("AI_TIMEOUT")), ms))
    ]);
};

const aiKey = process.env.GEMINI_API_KEY || "";

if (!aiKey || aiKey === "undefined" || aiKey === "null") {
    console.error("CRITICAL: GEMINI_API_KEY is missing or invalid in the browser environment. Please check your AI Studio Secrets.");
} else {
    console.log("GEMINI_API_KEY is present (length: " + aiKey.length + ", starts with: " + aiKey.substring(0, 4) + "...)");
}

(window as any).GEMINI_KEY_PRESENT = !!aiKey;
const ai = new GoogleGenAI({ apiKey: aiKey });

const safeParseJSON = (text: string | undefined, defaultValue: any = []) => {
    if (!text) {
        console.warn("safeParseJSON received empty text.");
        return defaultValue;
    }
    try {
        // Try direct parse first
        return JSON.parse(text);
    } catch (e) {
        console.log("JSON.parse failed, attempting extraction from:", text);
        // Try to extract from markdown code blocks
        const match = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/);
        if (match && match[1]) {
            try {
                return JSON.parse(match[1]);
            } catch (e2) {
                console.error("Failed to parse extracted JSON:", e2);
            }
        }
        // Last resort: try to find anything that looks like an array or object
        const arrayMatch = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
        if (arrayMatch) {
            try {
                return JSON.parse(arrayMatch[0]);
            } catch (e3) {}
        }
        const objectMatch = text.match(/\{\s*[\s\S]*\s*\}/);
        if (objectMatch) {
            try {
                return JSON.parse(objectMatch[0]);
            } catch (e4) {}
        }
        
        console.error("Failed to parse JSON from text:", text);
        return defaultValue;
    }
};

/**
 * V3: Core Logic Extraction from Text
 */
export const generateProductsFromText = async (text: string, category: ProjectCategory): Promise<Product[]> => {
    const prompt = `Analyze this project title/description: "${text}" in category "${category}".
    Identify 3-5 specific tools or materials required. 
    Return as a JSON array of objects with: name, brand, estimatedPrice (string), retailer (Amazon/Home Depot/eBay), sourceType ('affiliate'), matchType ('exact'|'similar'|'alternative').`;

    try {
        const response = await withTimeout(ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                maxOutputTokens: 2048,
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            brand: { type: Type.STRING },
                            estimatedPrice: { type: Type.STRING },
                            retailer: { type: Type.STRING },
                            sourceType: { type: Type.STRING },
                            matchType: { type: Type.STRING }
                        },
                        required: ["name", "estimatedPrice", "retailer"]
                    }
                }
            }
        }), 30000);

        const raw = safeParseJSON(response.text, []);
        return raw.map((p: any) => ({
            id: Math.random().toString(36).substr(2, 9),
            name: p.name,
            brand: p.brand || "Generic",
            price: asMoney(p.estimatedPrice),
            imageUrl: `https://picsum.photos/seed/${encodeURIComponent(p.name)}/400/400`,
            purchaseUrl: `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(p.brand + ' ' + p.name)}&mkrid=711-53200-19255-0&siteid=0&campid=${PLATFORM_DEFAULT_CAMPID}&toolid=10001&customid=w1d1_ai_gen`,
            retailer: p.retailer,
            sourceType: 'affiliate',
            confidence: 0.85,
            matchType: p.matchType || 'similar'
        }));
    } catch (e) {
        console.error("AI Text Analysis Failed:", e);
        return [];
    }
};

/**
 * V3: Visual Logic Extraction from Images
 */
export const generateProductsFromImages = async (base64s: string[], mimeType: string, category: ProjectCategory): Promise<Product[]> => {
    const prompt = `Analyze these project frames. Category: ${category}.
    Identify specific tools, hardware, or materials visible. 
    Return as a JSON array of objects with: name, brand (if visible), estimatedPrice, retailer, matchType.`;

    try {
        const response = await withTimeout(ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: {
                parts: [
                    { text: prompt },
                    ...base64s.map(b => ({ inlineData: { data: b, mimeType } }))
                ]
            },
            config: {
                responseMimeType: "application/json",
                maxOutputTokens: 2048,
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            brand: { type: Type.STRING },
                            estimatedPrice: { type: Type.STRING },
                            retailer: { type: Type.STRING },
                            matchType: { type: Type.STRING }
                        },
                        required: ["name", "estimatedPrice"]
                    }
                }
            }
        }), 45000);

        const raw = safeParseJSON(response.text, []);
        return raw.map((p: any) => ({
            id: Math.random().toString(36).substr(2, 9),
            name: p.name,
            brand: p.brand || "Detected",
            price: asMoney(p.estimatedPrice),
            imageUrl: `https://picsum.photos/seed/${encodeURIComponent(p.name)}/400/400`,
            purchaseUrl: `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(p.brand + ' ' + p.name)}&mkrid=711-53200-19255-0&siteid=0&campid=${PLATFORM_DEFAULT_CAMPID}&toolid=10001&customid=w1d1_visual_gen`,
            retailer: p.retailer || "Amazon",
            sourceType: 'affiliate',
            confidence: 0.9,
            matchType: p.matchType || 'exact'
        }));
    } catch (e) {
        console.error("AI Visual Analysis Failed:", e);
        return [];
    }
};

/**
 * V3: URL Pulse Analysis
 */
export const generateProductsFromUrl = async (url: string, category: ProjectCategory): Promise<Product[]> => {
    // In a real app, we'd fetch the URL content. For now, we use the URL context tool or fallback to text analysis of the URL itself.
    try {
        const response = await withTimeout(ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Analyze this project URL: ${url}. Category: ${category}. 
            Identify the core project and return 3-5 required products as JSON.`,
            config: {
                tools: [{ urlContext: {} }],
                responseMimeType: "application/json",
                maxOutputTokens: 2048,
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            brand: { type: Type.STRING },
                            estimatedPrice: { type: Type.STRING },
                            retailer: { type: Type.STRING },
                            matchType: { type: Type.STRING }
                        },
                        required: ["name", "estimatedPrice"]
                    }
                }
            }
        }), 40000);
        
        const raw = safeParseJSON(response.text, []);
        // Map to products...
        return raw.map((p: any) => ({
            id: Math.random().toString(36).substr(2, 9),
            name: p.name || "Project Item",
            brand: p.brand || "Generic",
            price: asMoney(p.price || "25.00"),
            imageUrl: `https://picsum.photos/seed/${encodeURIComponent(p.name || 'item')}/400/400`,
            purchaseUrl: `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(p.name || 'item')}&mkrid=711-53200-19255-0&siteid=0&campid=${PLATFORM_DEFAULT_CAMPID}&toolid=10001&customid=w1d1_url_gen`,
            retailer: "eBay",
            sourceType: 'affiliate'
        }));
    } catch (e) {
        console.error("AI URL Analysis Failed:", e);
        return generateProductsFromText(url.split('/').pop() || "Project", category);
    }
};

/**
 * V3: Complementary Product Generation
 */
export const generateComplementaryProducts = async (title: string, products: Product[], category: ProjectCategory): Promise<Product[]> => {
    const productNames = products.map(p => p.name).join(", ");
    const prompt = `Given a project "${title}" using [${productNames}], suggest 3 complementary items (safety gear, accessories, or consumables).
    Return as JSON array with name, estimatedPrice, retailer.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: { 
                responseMimeType: "application/json",
                maxOutputTokens: 2048,
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            estimatedPrice: { type: Type.STRING },
                            retailer: { type: Type.STRING }
                        },
                        required: ["name", "estimatedPrice"]
                    }
                }
            }
        });
        const raw = safeParseJSON(response.text, []);
        return raw.map((p: any) => ({
            id: Math.random().toString(36).substr(2, 9),
            name: p.name,
            price: asMoney(p.estimatedPrice),
            imageUrl: `https://picsum.photos/seed/${encodeURIComponent(p.name)}/400/400`,
            purchaseUrl: `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(p.name)}&mkrid=711-53200-19255-0&siteid=0&campid=${PLATFORM_DEFAULT_CAMPID}&toolid=10001&customid=w1d1_comp_gen`,
            retailer: p.retailer || "Amazon",
            sourceType: 'affiliate'
        }));
    } catch (e) {
        console.error("AI Complementary Generation Failed:", e);
        return [];
    }
};

/**
 * V3: Project Insights (Pro Tier)
 */
export const generateV3ProjectInsights = async (title: string, products: Product[], category: ProjectCategory): Promise<ProjectInsights> => {
    const productList = products.map(p => p.name).join(", ");
    const prompt = `Perform a deep technical analysis for project: "${title}" in category "${category}".
    Using these products: [${productList}].
    Return a JSON object with:
    - difficulty: "Easy" | "Medium" | "Hard" | "Expert"
    - timeEstimate: string (e.g. "2-4 Hours")
    - costEstimate: { low: number, high: number, currency: "USD" }
    - safetyRating: number (1-5)
    - safetyProtocols: array of { hazard: string, prevention: string, requiredGear: array }
    - toolsRequired: array of strings
    - materialsRequired: array of strings
    - technicalPrerequisites: array of strings`;

    try {
        const response = await withTimeout(ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: { 
                responseMimeType: "application/json",
                maxOutputTokens: 4096,
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        difficulty: { type: Type.STRING },
                        timeEstimate: { type: Type.STRING },
                        costEstimate: {
                            type: Type.OBJECT,
                            properties: {
                                low: { type: Type.NUMBER },
                                high: { type: Type.NUMBER },
                                currency: { type: Type.STRING }
                            },
                            required: ["low", "high", "currency"]
                        },
                        safetyRating: { type: Type.NUMBER },
                        safetyProtocols: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    hazard: { type: Type.STRING },
                                    prevention: { type: Type.STRING },
                                    requiredGear: { type: Type.ARRAY, items: { type: Type.STRING } }
                                },
                                required: ["hazard", "prevention", "requiredGear"]
                            }
                        },
                        toolsRequired: { type: Type.ARRAY, items: { type: Type.STRING } },
                        materialsRequired: { type: Type.ARRAY, items: { type: Type.STRING } },
                        technicalPrerequisites: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["difficulty", "timeEstimate", "costEstimate", "safetyRating", "safetyProtocols", "toolsRequired", "materialsRequired"]
                }
            }
        }), 45000);

        return safeParseJSON(response.text, {
            difficulty: 'Medium',
            timeEstimate: 'Varies',
            costEstimate: { low: 50, high: 150, currency: 'USD' },
            safetyRating: 4,
            safetyProtocols: [{ hazard: "General DIY Risks", prevention: "Wear protection", requiredGear: ["Safety Goggles"] }],
            toolsRequired: ["Basic Hand Tools"],
            materialsRequired: ["Project Specific Materials"]
        });
    } catch (e) {
        console.error("AI Project Insights Failed:", e);
        // Fallback insights
        return {
            difficulty: 'Medium',
            timeEstimate: 'Varies',
            costEstimate: { low: 50, high: 150, currency: 'USD' },
            safetyRating: 4,
            safetyProtocols: [{ hazard: "General DIY Risks", prevention: "Wear protection", requiredGear: ["Safety Goggles"] }],
            toolsRequired: ["Basic Hand Tools"],
            materialsRequired: ["Project Specific Materials"]
        };
    }
};

/**
 * V3: Project Assistant Chat
 */
export const createProjectAssistantChat = (videoTitle: string, category: string) => {
    return ai.chats.create({
        model: "gemini-3.1-pro-preview",
        config: {
            systemInstruction: `You are the Watch1Do1 Build Assistant. 
            You are helping a maker with the project: "${videoTitle}" in category "${category}".
            Focus on technical accuracy, safety, and step-by-step guidance.
            If they ask about tools, refer to the ones identified in the build hub.`
        }
    });
};

/**
 * V3: Specific Product Search (Native Handshake)
 */
export const searchSpecificProduct = async (query: string): Promise<Product | null> => {
    try {
        // First check native inventory
        const nativeResults = await bigCommerceService.searchInventory(query);
        if (nativeResults && nativeResults.length > 0) {
            return nativeResults[0];
        }

        // Fallback to AI search
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Find the best match for product: "${query}". Return as JSON with name, brand, price, retailer.`,
            config: { tools: [{ googleSearch: {} }], responseMimeType: "application/json" }
        });
        
        const p = JSON.parse(response.text || "{}");
        if (!p.name) return null;

        return {
            id: Math.random().toString(36).substr(2, 9),
            name: p.name,
            brand: p.brand || "Found",
            price: asMoney(p.price || "0.00"),
            imageUrl: `https://picsum.photos/seed/${encodeURIComponent(p.name)}/400/400`,
            purchaseUrl: `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(p.name)}&mkrid=711-53200-19255-0&siteid=0&campid=${PLATFORM_DEFAULT_CAMPID}&toolid=10001&customid=w1d1_search`,
            retailer: p.retailer || "eBay",
            sourceType: 'affiliate'
        };
    } catch (e) {
        return null;
    }
};

/**
 * V3: Product Revalidation
 */
export const revalidateProductAvailability = async (product: Product): Promise<boolean> => {
    // Mock revalidation
    await wait(800);
    return Math.random() > 0.1; // 90% chance it's still available
};
