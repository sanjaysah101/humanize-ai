export interface RankedSynonym {
  word: string;
  score: number;
  contextScore: number;
  tags?: string[];
}

export interface SynonymScores {
  emotionalToneScore: number;
  formalityScore: number;
  contextScore: number;
}
