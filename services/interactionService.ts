import { AnalysisResult, DrugEntry, RiskLevel, InteractionDetail, CombinedEffect, IndividualDrugAnalysis } from "../types";

// NLM Drug Interaction API
const INTERACTION_API = "https://rxnav.nlm.nih.gov/REST/interaction/list.json";

/**
 * Heuristic to determine risk level from text description since NLM doesn't always provide a clean "Severity" field.
 */
const determineSeverity = (description: string): RiskLevel => {
  const text = description.toLowerCase();
  if (text.includes("contraindicated") || text.includes("severe") || text.includes("life-threatening")) return RiskLevel.SEVERE;
  if (text.includes("monitor") || text.includes("caution") || text.includes("risk")) return RiskLevel.HIGH;
  if (text.includes("moderate")) return RiskLevel.MODERATE;
  return RiskLevel.LOW;
};

/**
 * Extract potential symptoms from the description for the "Combined Effects" section.
 */
const extractSymptoms = (description: string): string => {
  if (description.includes("bleeding")) return "Increased Bleeding Risk";
  if (description.includes("drowsiness") || description.includes("sedation")) return "Excessive Drowsiness";
  if (description.includes("arrhythmia") || description.includes("qt prolongation")) return "Heart Rhythm Irregularities";
  if (description.includes("hypotension") || description.includes("blood pressure")) return "Blood Pressure Changes";
  if (description.includes("toxicity")) return "Drug Toxicity";
  return "Interaction Effect";
};

export const analyzeDrugInteractions = async (drugs: DrugEntry[]): Promise<AnalysisResult> => {
  // Filter for drugs that strictly have an RxCUI (ID)
  const validDrugs = drugs.filter(d => d.rxcui);
  
  if (validDrugs.length < 2) {
     // If we don't have at least 2 drugs with valid IDs, we cannot check interactions.
     const hasUnidentifiedDrugs = drugs.length >= 2 && validDrugs.length < 2;
     
     return {
         riskLevel: RiskLevel.UNKNOWN,
         summary: hasUnidentifiedDrugs 
            ? "Unable to analyze. Please delete the drugs and re-add them by selecting from the dropdown menu to ensure they are recognized." 
            : "Please add at least two recognized medications to check for interactions.",
         interactions: [],
         individualAnalyses: drugs.map(d => ({
             drugName: d.name,
             usageSummary: d.rxcui ? "ID verified." : "Drug ID not found. Please re-add from suggestions.",
             commonSideEffects: []
         })),
         combinedSideEffects: [],
         disclaimer: "Data provided by NLM. Always consult a healthcare professional."
     };
  }

  // 1. Prepare RxCUIs
  const rxcuis = validDrugs.map(d => d.rxcui).join("+");

  try {
    // 2. Call NLM API
    const response = await fetch(`${INTERACTION_API}?rxcuis=${rxcuis}`);
    
    if (!response.ok) {
        throw new Error(`Service unavailable (Status: ${response.status})`);
    }

    const text = await response.text();
    let data;
    try {
        data = JSON.parse(text);
    } catch (e) {
        // This handles the "Not found" or HTML response case
        console.error("Invalid JSON from NLM", text);
        throw new Error("Received invalid data from NLM database. Please try again later.");
    }

    const interactionDetails: InteractionDetail[] = [];
    const combinedEffects: CombinedEffect[] = [];
    let maxSeverity = RiskLevel.LOW;

    // 3. Parse NLM Response
    if (data.fullInteractionTypeGroup) {
      data.fullInteractionTypeGroup.forEach((group: any) => {
        group.fullInteractionType.forEach((type: any) => {
          type.interactionPair.forEach((pair: any) => {
            const description = pair.description;
            const severity = determineSeverity(description);
            const drug1 = pair.interactionConcept[0].minConceptItem.name;
            const drug2 = pair.interactionConcept[1].minConceptItem.name;

            // Update Max Risk
            if (
                (severity === RiskLevel.SEVERE) || 
                (severity === RiskLevel.HIGH && maxSeverity !== RiskLevel.SEVERE) ||
                (severity === RiskLevel.MODERATE && maxSeverity === RiskLevel.LOW)
            ) {
                maxSeverity = severity;
            }

            // Add to Interactions List
            interactionDetails.push({
              drugsInvolved: [drug1, drug2],
              mechanism: "Pharmacological Interaction", // NLM doesn't always give mechanism, so we use generic
              severity: severity,
              description: description
            });

            // Add to Combined Effects (Simulated based on description)
            combinedEffects.push({
                symptom: extractSymptoms(description),
                description: description,
                managementTips: ["Consult your doctor about this interaction.", "Do not stop medication without advice."]
            });
          });
        });
      });
    }

    // 4. Construct Final Result
    const summary = interactionDetails.length > 0 
        ? `Found ${interactionDetails.length} potential interaction${interactionDetails.length > 1 ? 's' : ''}. The highest risk level is ${maxSeverity}.`
        : "No known interactions were found between the selected medications.";

    const individualAnalyses: IndividualDrugAnalysis[] = drugs.map(d => ({
        drugName: d.name,
        usageSummary: "Refer to official labeling.",
        commonSideEffects: [] 
    }));

    return {
      riskLevel: interactionDetails.length === 0 ? RiskLevel.LOW : maxSeverity,
      summary,
      individualAnalyses,
      interactions: interactionDetails,
      combinedSideEffects: combinedEffects,
      disclaimer: "Interaction data sourced from National Library of Medicine (RxNav). This tool does not provide medical advice."
    };

  } catch (error: any) {
    console.error("NLM API Error", error);
    throw new Error(error.message || "Failed to fetch interaction data from NLM.");
  }
};