import nlp from "compromise";

import { CONFIDENCE_THRESHOLDS } from "@/lib/constants/transformation";

export class PatternDetector {
  private nlpProcessor: typeof nlp;

  constructor() {
    this.nlpProcessor = nlp;
  }

  async detectPatterns(text: string): Promise<number> {
    const patterns = {
      repetition: this.detectRepetitionPatterns(text),
      structure: this.detectStructuralPatterns(text),
      transition: this.detectTransitionPatterns(text),
    };

    return Object.values(patterns).reduce((acc, score) => acc + score, 0) / 3;
  }

  private detectRepetitionPatterns(text: string): number {
    const words = text.toLowerCase().split(/\s+/);
    const wordFrequency: { [key: string]: number } = {};

    words.forEach((word) => {
      wordFrequency[word] = (wordFrequency[word] || 0) + 1;
    });

    const repetitionScore = 1 - Object.values(wordFrequency).filter((f) => f > 2).length / words.length;
    return Math.max(CONFIDENCE_THRESHOLDS.MIN_WORD_SCORE, repetitionScore);
  }

  private detectStructuralPatterns(text: string): number {
    const doc = this.nlpProcessor(text);
    const sentences = doc.sentences().out("array");
    const structures = sentences.map((s: string) => this.getSentenceStructure(s));

    const uniqueStructures = new Set(structures).size;
    return Math.min(1, uniqueStructures / sentences.length);
  }

  private detectTransitionPatterns(text: string): number {
    const doc = this.nlpProcessor(text);
    const sentences = doc.sentences().out("array");
    const transitions = this.findTransitionWords(sentences);

    return Math.min(1, transitions / sentences.length);
  }

  private getSentenceStructure(sentence: string): string {
    const doc = this.nlpProcessor(sentence);
    return doc.terms().out("tags").join("-");
  }

  private findTransitionWords(sentences: string[]): number {
    const transitionWords = new Set([
      "however",
      "therefore",
      "furthermore",
      "moreover",
      "consequently",
      "meanwhile",
      "nevertheless",
      "alternatively",
    ]);

    return sentences.filter((s) => s.split(/\s+/).some((word) => transitionWords.has(word.toLowerCase()))).length;
  }
}
