export interface SynonymResult {
  word: string;
  score: number;
  tags: string[];
}

export interface ISynonymProvider {
  getSynonyms(word: string): Promise<SynonymResult[]>;
}
