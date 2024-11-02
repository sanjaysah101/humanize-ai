import nlp from "compromise";

import { EmotionalTone } from "@/core/entities/transformation";
import { SynonymResult } from "@/core/interfaces/synonymProvider";
import { CONFIDENCE_THRESHOLDS } from "@/lib/constants/transformation";

export class EmotionalToneAnalyzer {
  private nlpProcessor: typeof nlp;
  private tonePatterns: Record<EmotionalTone, RegExp[]>;

  constructor() {
    this.nlpProcessor = nlp;
    this.tonePatterns = {
      positive: [
        /\b(good|great|excellent|amazing|wonderful|fantastic|happy|joy)\w*\b/i,
        /\b(success|achieve|accomplish|improve|enhance|benefit)\w*\b/i,
        /\b(optimistic|confident|positive|enthusiastic)\w*\b/i,
      ],
      negative: [
        /\b(bad|poor|terrible|awful|horrible|unfortunate|sad)\w*\b/i,
        /\b(fail|decline|worsen|decrease|reduce|problem)\w*\b/i,
        /\b(pessimistic|doubtful|negative|reluctant)\w*\b/i,
      ],
      professional: [
        /\b(implement|establish|maintain|conduct|proceed|facilitate)\w*\b/i,
        /\b(effective|efficient|professional|strategic|optimal)\w*\b/i,
        /\b(accordingly|furthermore|consequently|therefore)\w*\b/i,
      ],
      casual: [
        /\b(okay|cool|nice|awesome|great|fun|pretty)\w*\b/i,
        /\b(like|kind of|sort of|basically|actually)\w*\b/i,
        /\b(anyway|btw|fyi|tbh|literally)\w*\b/i,
      ],
      neutral: [], // No specific patterns for neutral tone
    };
  }

  async analyzeSynonym(synonym: SynonymResult, targetTone: EmotionalTone, contextWord: string): Promise<number> {
    const baseScore = this.calculateEmotionalScore(synonym, targetTone, contextWord);
    const intensityScore = this.calculateIntensityScore(synonym.word);
    const contextScore = this.calculateContextScore(synonym.word, contextWord);

    const finalScore = baseScore * 0.5 + intensityScore * 0.3 + contextScore * 0.2;

    return Math.max(CONFIDENCE_THRESHOLDS.MIN_EMOTIONAL_SCORE, Math.min(1, finalScore));
  }

  private calculateEmotionalScore(synonym: SynonymResult, targetTone: EmotionalTone, contextWord: string): number {
    if (targetTone === "neutral") return 1;

    const doc = this.nlpProcessor(`${contextWord} ${synonym.word}`);
    const patterns = this.tonePatterns[targetTone];
    const word = synonym.word.toLowerCase();
    let score = 0.6;

    // Check if word matches target tone patterns
    const matchesTargetTone = patterns.some((pattern) => pattern.test(word));
    if (matchesTargetTone) score = 0.9;

    // Check context compatibility using the existing doc
    const contextTone = this.getEmotionalTone(contextWord);
    if (contextTone !== "neutral" && contextTone !== targetTone) {
      score *= 0.8; // Penalize tone mismatch with context
    }

    // Use the combined doc to check for emotional coherence
    if (doc.has("#Positive") && doc.has("#Negative")) {
      score *= 0.7; // Penalize mixed emotions
    }

    // Check if context word modifies the emotional intensity
    const intensifiers = new Set(["very", "extremely", "highly"]);
    const diminishers = new Set(["slightly", "somewhat", "barely"]);

    if (intensifiers.has(contextWord.toLowerCase())) {
      score = Math.min(1, score * 1.2);
    } else if (diminishers.has(contextWord.toLowerCase())) {
      score *= 0.8;
    }

    return Math.max(CONFIDENCE_THRESHOLDS.MIN_EMOTIONAL_SCORE, Math.min(1, score));
  }

  private calculateIntensityScore(word: string): number {
    const intensifiers = new Set([
      "very",
      "extremely",
      "incredibly",
      "absolutely",
      "totally",
      "highly",
      "completely",
      "entirely",
      "utterly",
      "thoroughly",
    ]);

    const diminishers = new Set([
      "somewhat",
      "slightly",
      "fairly",
      "rather",
      "quite",
      "moderately",
      "relatively",
      "partially",
      "mildly",
      "barely",
    ]);

    if (intensifiers.has(word.toLowerCase())) return 0.9;
    if (diminishers.has(word.toLowerCase())) return 0.4;

    return 0.7;
  }

  private calculateContextScore(word: string, contextWord: string): number {
    const doc = this.nlpProcessor(`${contextWord} ${word}`);
    let score = 0.7;

    // Check for semantic compatibility
    if (doc.has("#Positive") && doc.has("#Negative")) score *= 0.5;
    if (doc.has("#Professional") && doc.has("#Casual")) score *= 0.5;
    if (doc.has("#Formal") && doc.has("#Informal")) score *= 0.5;

    // Check for emotional consistency
    const emotions = new Set(doc.match("#Emotion").out("array"));
    if (emotions.size > 1) score *= 0.8;

    return score;
  }

  getEmotionalTone(text: string): EmotionalTone {
    const scores = Object.entries(this.tonePatterns).map(([tone, patterns]) => {
      const matchCount = patterns.reduce((count, pattern) => count + (pattern.test(text) ? 1 : 0), 0);
      return { tone: tone as EmotionalTone, score: matchCount };
    });

    const highestScore = scores.reduce((max, curr) => (curr.score > max.score ? curr : max));

    return highestScore.score > 0 ? highestScore.tone : "neutral";
  }
}
