export type EmotionalTone = "neutral" | "positive" | "negative" | "professional" | "casual";

export interface TransformationOptions {
  creativity: number;
  formality: "informal" | "formal";
  preserveIntent: boolean;
  emotionalTone: EmotionalTone;
  varietyLevel: number;
  contextPreservation: number;
}

export interface TransformationResult {
  originalText: string;
  transformedText: string;
  confidence: number;
  transformations: TransformationChange[];
}

export interface TransformationChange {
  original: string;
  replacement: string;
  type: "word" | "syntax" | "emotional";
  confidence: number;
}

export interface TransformationResponse {
  success: boolean;
  data?: TransformationResult;
  error?: string;
}

export interface TransformationListItem {
  original: string;
  replacement: string;
  type: "word" | "syntax" | "emotional";
  confidence: number;
}
