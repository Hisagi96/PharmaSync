import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, DrugEntry } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeDrugInteractions = async (drugs: DrugEntry[]): Promise<AnalysisResult> => {
  if (!drugs || drugs.length === 0) {
    throw new Error("No drugs provided for analysis.");
  }

  const drugDescriptions = drugs.map(d => 
    d.genericName ? `${d.name} (Generic: ${d.genericName})` : d.name
  ).join(", ");

  const prompt = `
    Analyze the following list of drugs for potential interactions, side effects, and management strategies.
    Drugs: ${drugDescriptions}.
    
    Act as a senior clinical pharmacologist. 
    1. Identify individual side effects for each drug.
    2. Identify specific interactions between any pairs or groups of drugs.
    3. Determine the overall risk level.
    4. Predict combined side effects that might be exacerbated by taking these together.
    5. Provide actionable management tips or remedies for these side effects.
    
    Ensure the data is accurate based on established medical knowledge bases.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction: "You are a helpful and accurate medical assistant. You strictly provide medical facts about drug interactions. You always include a disclaimer that this is not a substitute for professional medical advice.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          riskLevel: {
            type: Type.STRING,
            enum: ["Low", "Moderate", "High", "Severe", "Unknown"],
            description: "The highest severity level of interaction found."
          },
          summary: {
            type: Type.STRING,
            description: "A concise summary of the analysis for the patient."
          },
          individualAnalyses: {
            type: Type.ARRAY,
            description: "Analysis for each single drug.",
            items: {
              type: Type.OBJECT,
              properties: {
                drugName: { type: Type.STRING },
                usageSummary: { type: Type.STRING, description: "Briefly what it treats." },
                commonSideEffects: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      symptom: { type: Type.STRING },
                      frequency: { type: Type.STRING },
                      severity: { type: Type.STRING }
                    }
                  }
                }
              }
            }
          },
          interactions: {
            type: Type.ARRAY,
            description: "Specific interaction mechanisms between drugs.",
            items: {
              type: Type.OBJECT,
              properties: {
                drugsInvolved: { type: Type.ARRAY, items: { type: Type.STRING } },
                mechanism: { type: Type.STRING, description: "Pharmacokinetic or pharmacodynamic mechanism." },
                severity: { type: Type.STRING, enum: ["Low", "Moderate", "High", "Severe", "Unknown"] },
                description: { type: Type.STRING, description: "Detailed explanation of the interaction." }
              }
            }
          },
          combinedSideEffects: {
            type: Type.ARRAY,
            description: "Side effects that are unique to or worsened by the combination, with remedies.",
            items: {
              type: Type.OBJECT,
              properties: {
                symptom: { type: Type.STRING },
                description: { type: Type.STRING, description: "Why this happens with this combination." },
                managementTips: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING },
                  description: "Practical advice or remedies to manage this side effect."
                }
              }
            }
          },
          disclaimer: {
            type: Type.STRING,
            description: "Standard medical disclaimer."
          }
        },
        required: ["riskLevel", "summary", "individualAnalyses", "interactions", "combinedSideEffects", "disclaimer"]
      }
    }
  });

  if (!response.text) {
    throw new Error("Failed to generate analysis.");
  }

  try {
    return JSON.parse(response.text) as AnalysisResult;
  } catch (e) {
    console.error("JSON Parse Error", e);
    throw new Error("Failed to parse analysis results.");
  }
};
