import { EmotionalTone } from "../entities/transformation";
import { SynonymResult } from "./synonymProvider";

export interface IEmotionalAnalyzer {
  analyzeSynonym(synonym: SynonymResult, targetTone: EmotionalTone, contextWord: string): Promise<number>;

  getEmotionalTone(text: string): EmotionalTone;
}

export interface ISynonymResult {
  word: string;
  score: number;
  tags?: string[];
}

export interface IWordContext {
  previousWord?: string;
  nextWord?: string;
}
