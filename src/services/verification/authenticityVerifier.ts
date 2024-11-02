import nlp from "compromise";

import { CONFIDENCE_THRESHOLDS } from "../../lib/constants/transformation";
import { LanguageMetrics } from "./languageMetrics";
import { PatternDetector } from "./patternDetector";
import { StyleAnalyzer } from "./styleAnalyzer";

export interface AuthenticityScore {
  overall: number;
  metrics: {
    languageNaturalness: number;
    stylistic: number;
    patternVariation: number;
    emotionalCoherence: number;
  };
  features: string[];
}

export class AuthenticityVerifier {
  private languageMetrics: LanguageMetrics;
  private styleAnalyzer: StyleAnalyzer;
  private patternDetector: PatternDetector;
  private nlpProcessor: typeof nlp;

  constructor() {
    this.languageMetrics = new LanguageMetrics();
    this.styleAnalyzer = new StyleAnalyzer();
    this.patternDetector = new PatternDetector();
    this.nlpProcessor = nlp;
  }

  async verifyAuthenticity(text: string): Promise<AuthenticityScore> {
    const [languageScore, styleScore, patternScore] = await Promise.all([
      this.languageMetrics.analyze(text),
      this.styleAnalyzer.evaluate(text),
      this.patternDetector.detectPatterns(text),
    ]);

    const emotionalScore = await this.analyzeEmotionalCoherence(text);

    return {
      overall: this.calculateOverallScore({
        languageScore,
        styleScore,
        patternScore,
        emotionalScore,
      }),
      metrics: {
        languageNaturalness: languageScore,
        stylistic: styleScore,
        patternVariation: patternScore,
        emotionalCoherence: emotionalScore,
      },
      features: this.extractHumanFeatures(text),
    };
  }

  private async analyzeEmotionalCoherence(text: string): Promise<number> {
    try {
      const doc = this.nlpProcessor(text);
      const sentences = doc.sentences().out("array");

      // Track emotional indicators across sentences
      const emotionalPatterns = sentences.map((sentence: string) => {
        const sentenceDoc = this.nlpProcessor(sentence);
        return {
          // Check for emotional indicators
          hasPositive: sentenceDoc.has("#Positive"),
          hasNegative: sentenceDoc.has("#Negative"),
          hasIntensifier: sentenceDoc.has("#Intensity"),
          hasEmotionalWord: sentenceDoc.has("#Emotion"),
        };
      });

      // Calculate consistency scores
      const consistencyScores = {
        toneShift: this.calculateToneShiftScore(emotionalPatterns),
        intensityVariance: this.calculateIntensityVariance(emotionalPatterns),
        emotionalDensity: this.calculateEmotionalDensity(emotionalPatterns),
      };

      // Weight and combine scores
      const weights = {
        toneShift: 0.4,
        intensityVariance: 0.3,
        emotionalDensity: 0.3,
      };

      const coherenceScore =
        consistencyScores.toneShift * weights.toneShift +
        consistencyScores.intensityVariance * weights.intensityVariance +
        consistencyScores.emotionalDensity * weights.emotionalDensity;

      return Math.min(1, Math.max(CONFIDENCE_THRESHOLDS.MIN_EMOTIONAL_SCORE, coherenceScore));
    } catch {
      return 0.85; // Fallback to default score
    }
  }

  private calculateToneShiftScore(
    patterns: Array<{
      hasPositive: boolean;
      hasNegative: boolean;
      hasIntensifier: boolean;
      hasEmotionalWord: boolean;
    }>
  ): number {
    let abruptShifts = 0;

    for (let i = 1; i < patterns.length; i++) {
      const current = patterns[i];
      const previous = patterns[i - 1];

      if ((previous.hasPositive && current.hasNegative) || (previous.hasNegative && current.hasPositive)) {
        abruptShifts++;
      }
    }

    return 1 - abruptShifts / patterns.length;
  }

  private calculateIntensityVariance(
    patterns: Array<{
      hasPositive: boolean;
      hasNegative: boolean;
      hasIntensifier: boolean;
      hasEmotionalWord: boolean;
    }>
  ): number {
    const intensities = patterns.map((p) => (p.hasIntensifier ? 1 : 0) + (p.hasEmotionalWord ? 1 : 0));

    const average = intensities.reduce((sum, val) => sum + val, 0) / intensities.length;
    const variance = intensities.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / intensities.length;

    return 1 - Math.min(variance, 1);
  }

  private calculateEmotionalDensity(
    patterns: Array<{
      hasPositive: boolean;
      hasNegative: boolean;
      hasIntensifier: boolean;
      hasEmotionalWord: boolean;
    }>
  ): number {
    const emotionalSentences = patterns.filter((p) => p.hasEmotionalWord || p.hasPositive || p.hasNegative).length;

    return emotionalSentences / patterns.length;
  }

  private extractHumanFeatures(text: string): string[] {
    const features: string[] = [];
    const doc = this.nlpProcessor(text);
    const sentences = doc.sentences().out("array");

    // Check for natural pause patterns using punctuation and sentence length variety
    const sentenceLengths = sentences.map((s: string) => s.split(/\s+/).length);
    const lengthVariance = Math.sqrt(
      sentenceLengths.reduce(
        (sum: number, len: number) =>
          sum + Math.pow(len - sentenceLengths.reduce((a: number, b: number) => a + b) / sentenceLengths.length, 2),
        0
      ) / sentenceLengths.length
    );
    if (lengthVariance > 2) {
      features.push("Natural pause patterns");
    }

    // Check for varied vocabulary using techniques from LanguageMetrics
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const uniqueWords = new Set(words);
    if (uniqueWords.size / words.length > 0.6) {
      features.push("Varied vocabulary");
    }

    // Check for emotional consistency using patterns from EmotionalToneAnalyzer
    const emotionalPatterns = sentences.map((sentence: string) => {
      const sentenceDoc = this.nlpProcessor(sentence);
      return {
        hasPositive: sentenceDoc.has("#Positive"),
        hasNegative: sentenceDoc.has("#Negative"),
        hasEmotional: sentenceDoc.has("#Emotion"),
      };
    });

    const emotionalConsistency =
      emotionalPatterns.filter(
        (p: { hasEmotional: boolean; hasPositive: boolean; hasNegative: boolean }) =>
          p.hasEmotional && ((p.hasPositive && !p.hasNegative) || (p.hasNegative && !p.hasPositive))
      ).length / emotionalPatterns.length;

    if (emotionalConsistency > 0.7) {
      features.push("Consistent emotion");
    }

    // Check for context-aware references using patterns from WordLevelTransformer
    const hasContextAwareReferences = sentences.some((sentence: string, index: number) => {
      if (index === 0) return false;
      const currentDoc = this.nlpProcessor(sentence);
      const previousDoc = this.nlpProcessor(sentences[index - 1]);

      // Check for pronouns referring to previous subjects
      const hasPronouns = currentDoc.has("#Pronoun");
      const hasPreviousSubject = previousDoc.has("#Subject");

      // Check for semantic connections
      const currentTopics = new Set(currentDoc.nouns().out("array"));
      const previousTopics = new Set(previousDoc.nouns().out("array"));
      const hasTopicOverlap = [...currentTopics].some((topic) => previousTopics.has(topic));

      return (hasPronouns && hasPreviousSubject) || hasTopicOverlap;
    });

    if (hasContextAwareReferences) {
      features.push("Context-aware references");
    }

    // Add additional features based on StyleAnalyzer patterns
    if (this.hasNaturalTransitions(sentences)) {
      features.push("Natural transition words");
    }

    if (this.hasConsistentTense(doc)) {
      features.push("Consistent tense usage");
    }

    return features;
  }

  private hasNaturalTransitions(sentences: string[]): boolean {
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

    const transitionCount = sentences.filter((s) =>
      s.split(/\s+/).some((word) => transitionWords.has(word.toLowerCase()))
    ).length;

    return transitionCount / sentences.length >= 0.2;
  }

  private hasConsistentTense(doc: ReturnType<typeof nlp>): boolean {
    const presentCount = doc.match("#PresentTense").length;
    const pastCount = doc.match("#PastTense").length;
    const total = presentCount + pastCount;

    return total > 0 && Math.max(presentCount, pastCount) / total > 0.7;
  }

  private calculateOverallScore(metrics: {
    languageScore: number;
    styleScore: number;
    patternScore: number;
    emotionalScore: number;
  }): number {
    const weights = {
      language: 0.3,
      style: 0.3,
      pattern: 0.2,
      emotional: 0.2,
    };

    return (
      metrics.languageScore * weights.language +
      metrics.styleScore * weights.style +
      metrics.patternScore * weights.pattern +
      metrics.emotionalScore * weights.emotional
    );
  }
}
