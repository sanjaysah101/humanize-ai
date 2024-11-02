import nlp from "compromise";

import { CONFIDENCE_THRESHOLDS } from "@/lib/constants/transformation";

export class StyleAnalyzer {
  private nlpProcessor: typeof nlp;

  constructor() {
    this.nlpProcessor = nlp;
  }

  async evaluate(text: string): Promise<number> {
    const styleMetrics = {
      formalityScore: this.analyzeFormalityLevel(text),
      consistencyScore: this.analyzeStyleConsistency(text),
      toneScore: this.analyzeToneConsistency(text),
    };

    return Object.values(styleMetrics).reduce((acc, score) => acc + score, 0) / 3;
  }

  private analyzeFormalityLevel(text: string): number {
    const doc = this.nlpProcessor(text);
    const informalPatterns = /('ll|'re|'ve|gonna|wanna|dunno|ain't)/g;
    const informalCount = (text.match(informalPatterns) || []).length;

    // Add NLP-based formality checks
    const slangCount = doc.match("#Slang").length;
    const informalPronounCount = doc.match("(gonna|wanna|gotta|dunno)").length;
    const contractionCount = doc.contractions().length;

    const words = text.split(/\s+/).length;
    const totalInformalCount = informalCount + slangCount + informalPronounCount + contractionCount * 0.5;

    return Math.max(CONFIDENCE_THRESHOLDS.MIN_WORD_SCORE, 1 - totalInformalCount / words);
  }

  private analyzeStyleConsistency(text: string): number {
    const doc = this.nlpProcessor(text);
    const sentences = doc.sentences().out("array");
    let consistencyScore = 1;

    // Analyze voice consistency (active/passive)
    const voicePatterns = sentences.map((s: string) => this.nlpProcessor(s).has("#Passive"));
    const voiceChanges = voicePatterns.filter((v: boolean, i: number) => i > 0 && v !== voicePatterns[i - 1]).length;

    consistencyScore *= 1 - voiceChanges / sentences.length;

    return Math.max(CONFIDENCE_THRESHOLDS.MIN_WORD_SCORE, consistencyScore);
  }

  private analyzeToneConsistency(text: string): number {
    const doc = this.nlpProcessor(text);
    const sentences = doc.sentences().out("array");
    const toneScores = sentences.map((s: string) => this.getSentenceTone(s));

    const toneVariance = this.calculateVariance(toneScores);
    return Math.max(CONFIDENCE_THRESHOLDS.MIN_WORD_SCORE, 1 - toneVariance);
  }

  private getSentenceTone(sentence: string): number {
    const doc = this.nlpProcessor(sentence);
    const positiveWords = doc.match("#Positive").length;
    const negativeWords = doc.match("#Negative").length;
    const totalWords = sentence.split(/\s+/).length;

    return (positiveWords - negativeWords) / totalWords;
  }

  private calculateVariance(numbers: number[]): number {
    const mean = numbers.reduce((acc, val) => acc + val, 0) / numbers.length;
    const squareDiffs = numbers.map((value) => Math.pow(value - mean, 2));
    return Math.sqrt(squareDiffs.reduce((acc, val) => acc + val, 0) / numbers.length);
  }
}
