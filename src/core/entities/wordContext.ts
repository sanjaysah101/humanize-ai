export interface WordContext {
  word: string;
  previousWord: string | null;
  nextWord: string | null;
  pos: string;
  isImportantTerm: boolean;
}

export interface WordTransformation {
  word: string;
  synonyms: string[];
  score: number;
  pos?: string; // Part of speech
}
