export type EmotionalTone = 'neutral' | 'positive' | 'negative' | 'professional' | 'casual';

export interface TransformationOptions {
  formality: 'informal' | 'formal';
  creativity: number; // 0-1
  preserveIntent: boolean;
  emotionalTone: EmotionalTone;
  varietyLevel: number; // 0-1
  contextPreservation: number; // 0-1
}

export interface TransformationResult {
  originalText: string;
  transformedText: string;
  confidence: number;
  transformations: Array<{
    original: string;
    replacement: string;
    type: 'word' | 'syntax' | 'emotional';
    confidence: number;
  }>;
}

export interface WordTransformation {
  word: string;
  synonyms: string[];
  score: number;
  pos?: string; // Part of speech
} 