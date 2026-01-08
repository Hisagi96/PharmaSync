export interface DrugEntry {
  id: string;
  name: string;
  rxcui?: string; // RxNorm Concept Unique Identifier (required for NLM API)
  genericName?: string;
}

export enum RiskLevel {
  LOW = "Low",
  MODERATE = "Moderate",
  HIGH = "High",
  SEVERE = "Severe",
  UNKNOWN = "Unknown"
}

export interface SideEffect {
  symptom: string;
  frequency: string; // e.g., "Common", "Rare"
  severity: string; // e.g., "Mild", "Severe"
}

export interface IndividualDrugAnalysis {
  drugName: string;
  commonSideEffects: SideEffect[];
  usageSummary: string;
}

export interface InteractionDetail {
  drugsInvolved: string[];
  mechanism: string; // How they interact
  severity: RiskLevel;
  description: string;
}

export interface CombinedEffect {
  symptom: string;
  description: string;
  managementTips: string[]; // Solutions/Remedies
}

export interface AnalysisResult {
  riskLevel: RiskLevel;
  summary: string;
  individualAnalyses: IndividualDrugAnalysis[];
  interactions: InteractionDetail[];
  combinedSideEffects: CombinedEffect[];
  disclaimer: string;
}