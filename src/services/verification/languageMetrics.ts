import nlp from "compromise";
import { mean, std } from "mathjs";

import { CONFIDENCE_THRESHOLDS } from "@/lib/constants/transformation";

export class LanguageMetrics {
  private nlpProcessor: typeof nlp;

  constructor() {
    this.nlpProcessor = nlp;
  }

  async analyze(text: string): Promise<number> {
    const metrics = {
      sentenceVariety: this.analyzeSentenceVariety(text),
      vocabularyRichness: this.analyzeVocabularyRichness(text),
      grammarConsistency: this.analyzeGrammarConsistency(text),
    };

    return (metrics.sentenceVariety + metrics.vocabularyRichness + metrics.grammarConsistency) / 3;
  }

  private analyzeSentenceVariety(text: string): number {
    const doc = this.nlpProcessor(text);
    const sentences = doc.sentences().out("array");
    const lengths = sentences.map((s: string) => s.split(" ").length);
    const variety = std(lengths) / mean(lengths);

    return Math.min(1, Math.max(CONFIDENCE_THRESHOLDS.MIN_SENTENCE_SCORE, variety));
  }

  private analyzeVocabularyRichness(text: string): number {
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const uniqueWords = new Set(words);
    return Math.min(1, uniqueWords.size / words.length);
  }

  private analyzeGrammarConsistency(text: string): number {
    const doc = this.nlpProcessor(text);
    const sentences = doc.sentences();
    let validStructures = 0;

    sentences.forEach((sentence) => {
      const sentenceDoc = this.nlpProcessor(sentence.text());
      if (this.hasValidGrammarStructure(sentenceDoc)) {
        validStructures++;
      }
    });

    return validStructures / sentences.length;
  }

  private hasValidGrammarStructure(sentence: ReturnType<typeof nlp>): boolean {
    return sentence.has("#Subject") && sentence.has("#Verb");
  }
}
