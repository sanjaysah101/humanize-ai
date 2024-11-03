import { RankedSynonym, SynonymScores } from "@/core/entities/synonymRanking";
import { TransformationOptions } from "@/core/entities/transformation";
import { WordContext } from "@/core/entities/wordContext";
import { SynonymResult } from "@/core/interfaces/synonymProvider";
import { CONFIDENCE_THRESHOLDS } from "@/lib/constants/transformation";

import { EmotionalToneAnalyzer } from "../analysis/emotionalToneAnalyzer";

export class SynonymSelector {
  private emotionalAnalyzer: EmotionalToneAnalyzer;
  private usedSynonyms: Map<string, Set<string>> = new Map();

  constructor() {
    this.emotionalAnalyzer = new EmotionalToneAnalyzer();
  }

  async selectBestSynonym(synonyms: RankedSynonym[], options: TransformationOptions): Promise<SynonymResult> {
    if (synonyms.length === 0) {
      throw new Error("No synonyms available");
    }

    const varietyAdjustedSynonyms = this.applyVarietyLevel(synonyms, options.varietyLevel, options.creativity);

    // Select from the adjusted list
    const selectedIndex = Math.min(
      Math.floor(options.creativity * varietyAdjustedSynonyms.length),
      varietyAdjustedSynonyms.length - 1
    );

    const selected = varietyAdjustedSynonyms[selectedIndex];
    this.trackUsedSynonym(selected.word);

    return {
      word: selected.word,
      score: selected.contextScore,
      tags: selected.tags || [],
    };
  }

  private applyVarietyLevel(synonyms: RankedSynonym[], varietyLevel: number, creativity: number): RankedSynonym[] {
    // If variety level is low, return top-ranked synonyms
    if (varietyLevel <= 0.3) {
      return this.getTopSynonyms(synonyms, 3);
    }

    // Apply variety based on previously used synonyms
    const varietyAdjusted = synonyms.map((synonym) => ({
      ...synonym,
      contextScore: this.adjustScoreForVariety(synonym, varietyLevel),
    }));

    // Sort by adjusted scores
    varietyAdjusted.sort((a, b) => b.contextScore - a.contextScore);

    // Return a subset based on creativity and variety level
    const count = Math.max(3, Math.ceil(synonyms.length * (varietyLevel * creativity)));

    return varietyAdjusted.slice(0, count);
  }

  private adjustScoreForVariety(synonym: RankedSynonym, varietyLevel: number): number {
    let adjustedScore = synonym.contextScore;

    // Check if synonym has been used before
    for (const used of this.usedSynonyms.values()) {
      if (used.has(synonym.word)) {
        // Reduce score based on variety level and previous usage
        const penaltyFactor = Math.max(0.5, 1 - varietyLevel);
        adjustedScore *= penaltyFactor;
      }
    }

    // Bonus for unused synonyms when variety is high
    if (varietyLevel > 0.7 && !this.isWordUsed(synonym.word)) {
      adjustedScore *= 1.2;
    }

    return Math.max(CONFIDENCE_THRESHOLDS.MIN_WORD_SCORE, adjustedScore);
  }

  private trackUsedSynonym(word: string, originalWord?: string) {
    const key = originalWord || word;
    if (!this.usedSynonyms.has(key)) {
      this.usedSynonyms.set(key, new Set());
    }
    this.usedSynonyms.get(key)?.add(word);
  }

  private isWordUsed(word: string): boolean {
    for (const used of this.usedSynonyms.values()) {
      if (used.has(word)) return true;
    }
    return false;
  }

  private getTopSynonyms(synonyms: RankedSynonym[], count: number): RankedSynonym[] {
    return [...synonyms].sort((a, b) => b.contextScore - a.contextScore).slice(0, count);
  }

  async rankSynonyms(
    synonyms: SynonymResult[],
    context: WordContext,
    options: TransformationOptions
  ): Promise<RankedSynonym[]> {
    const rankedSynonyms = await Promise.all(
      synonyms.map(async (syn) => ({
        ...syn,
        contextScore: await this.calculateContextScore(syn, context, options),
      }))
    );

    return rankedSynonyms
      .filter((syn) => syn.contextScore > CONFIDENCE_THRESHOLDS.MIN_WORD_SCORE)
      .sort((a, b) => b.contextScore - a.contextScore);
  }

  private async calculateContextScore(
    synonym: SynonymResult,
    context: WordContext,
    options: TransformationOptions
  ): Promise<number> {
    const scores: SynonymScores = {
      emotionalToneScore: await this.emotionalAnalyzer.analyzeSynonym(synonym, options.emotionalTone, context.word),
      formalityScore: this.getFormalityScore(synonym, options.formality),
      contextScore: this.getContextPreservationScore(synonym, context) * options.contextPreservation,
    };

    return scores.emotionalToneScore * 0.3 + scores.formalityScore * 0.3 + scores.contextScore * 0.4;
  }

  private getFormalityScore(synonym: SynonymResult, formality: "formal" | "informal"): number {
    const formalPatterns = /^(implement|utilize|facilitate|optimize|establish)/i;
    const informalPatterns = /^(use|do|help|start|get)/i;

    if (formality === "formal") {
      return formalPatterns.test(synonym.word) ? 1.2 : 0.8;
    }
    return informalPatterns.test(synonym.word) ? 1.2 : 0.8;
  }

  private getContextPreservationScore(synonym: SynonymResult, context: WordContext): number {
    if (!context.previousWord && !context.nextWord) return 1;

    // Check if the synonym's POS matches the context
    const posMatch = synonym.tags?.includes(context.pos) ?? false;
    return posMatch ? 1.2 : 0.8;
  }
}
