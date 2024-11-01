export interface WordContext {
  word: string;
  previousWord: string | null;
  nextWord: string | null;
  pos: string;
  isImportantTerm: boolean;
}
