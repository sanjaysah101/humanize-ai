export interface SynonymResult {
  word: string;
  score: number;
  tags?: string[];
  contextPreservationScore?: number;
}

export interface ISynonymProvider {
  getSynonyms(word: string): Promise<SynonymResult[]>;
}
