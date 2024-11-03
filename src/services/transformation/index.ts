import { TransformationOptions, TransformationResult } from "@/core/entities/transformation";
import { EmotionalTone } from "@/core/entities/transformation";
import { TransformationChange } from "@/core/entities/transformation";
import { ISynonymProvider } from "@/core/interfaces/synonymProvider";
import { SynonymResult } from "@/core/interfaces/synonymProvider";
import { ITransformer } from "@/core/interfaces/transformer";
import { TransformationModels } from "@/lib/math/transformationModels";
import { EmotionalToneAnalyzer } from "@/services/analysis/emotionalToneAnalyzer";

import { CONFIDENCE_THRESHOLDS } from "../../lib/constants/transformation";
import { TransformerModel } from "../ai/transformerModel";
import { AuthenticityScore, AuthenticityVerifier } from "../verification/authenticityVerifier";
import { SyntaxTransformer } from "./syntax";
import { WordLevelTransformer } from "./wordLevel";

export class TextTransformer implements ITransformer {
  private wordLevelTransformer: WordLevelTransformer;
  private syntaxTransformer: SyntaxTransformer;
  private emotionalAnalyzer: EmotionalToneAnalyzer;
  private transformerModel: TransformerModel;
  private authenticityVerifier: AuthenticityVerifier;

  constructor(synonymProvider: ISynonymProvider) {
    this.wordLevelTransformer = new WordLevelTransformer(synonymProvider);
    this.syntaxTransformer = new SyntaxTransformer();
    this.emotionalAnalyzer = new EmotionalToneAnalyzer();
    this.transformerModel = new TransformerModel();
    this.authenticityVerifier = new AuthenticityVerifier();
  }

  async transform(text: string, options: TransformationOptions): Promise<TransformationResult> {
    try {
      // First apply word-level transformations with stricter context preservation
      const wordLevelResult = await this.wordLevelTransformer.transform(text, {
        ...options,
        contextPreservation: Math.max(options.contextPreservation, 0.8), // Enforce higher context preservation
      });

      // Filter out low-confidence transformations
      const validWordChanges = wordLevelResult.changes.filter(
        (change) => change.confidence > CONFIDENCE_THRESHOLDS.MIN_WORD_SCORE
      );

      // Apply filtered word changes sequentially
      let intermediateText = text;
      for (const change of validWordChanges) {
        // Use word boundaries in regex to prevent partial word replacements
        const regex = new RegExp(`\\b${this.escapeRegExp(change.original)}\\b`, "g");
        intermediateText = intermediateText.replace(regex, change.replacement);
      }

      // Apply Markov transformations for more natural flow when creativity is high
      if (options.creativity > 0.7) {
        const words = intermediateText.split(/\s+/);
        const matrix = TransformationModels.markovTransitionMatrix(words);
        const markovMap = this.convertMatrixToMap(intermediateText, matrix);
        intermediateText = this.applyMarkovTransformations(intermediateText, markovMap);
      }

      // Then apply syntax transformations
      const syntaxResult = this.syntaxTransformer.transform(intermediateText, options);

      // Combine changes from both transformations
      const allChanges = [
        ...wordLevelResult.changes.map((change) => ({
          ...change,
          type: "word" as const,
        })),
        ...syntaxResult.changes.map((change) => ({
          ...change,
          type: "syntax" as const,
        })),
      ];

      // Calculate overall confidence from word and syntax changes
      const initialConfidence = this.calculateOverallConfidence(allChanges);

      // Apply emotional tone adjustments if needed
      const finalText =
        options.emotionalTone !== "neutral"
          ? await this.adjustEmotionalTone(syntaxResult.text, options)
          : syntaxResult.text;

      try {
        // Try to apply AI transformation, but fall back to finalText if it fails
        const transformedText = await this.transformerModel.generateHumanLikeText(finalText, options);

        // Verify authenticity
        const authenticityScore = await this.authenticityVerifier.verifyAuthenticity(transformedText);

        // Apply mathematical models if needed
        const finalTransformedText =
          authenticityScore.overall < 0.85
            ? this.applyMarkovTransformations(
                transformedText,
                this.convertMatrixToMap(
                  transformedText,
                  TransformationModels.markovTransitionMatrix(transformedText.split(/\s+/))
                )
              )
            : transformedText;

        // Calculate final confidence
        const finalConfidence =
          this.calculateConfidence(finalText, finalTransformedText, authenticityScore) * initialConfidence;

        return {
          originalText: text,
          transformedText: finalTransformedText,
          confidence: finalConfidence,
          transformations: allChanges,
        };
      } catch {
        // Fall back to using the finalText if AI transformation fails
        return {
          originalText: text,
          transformedText: finalText,
          confidence: initialConfidence,
          transformations: allChanges,
        };
      }
    } catch {
      // Only return original text if everything fails
      return {
        originalText: text,
        transformedText: text,
        confidence: 1,
        transformations: [],
      };
    }
  }

  private async adjustEmotionalTone(text: string, options: TransformationOptions): Promise<string> {
    try {
      const sentences = text.split(/(?<=[.!?])\s+/);
      const adjustedSentences = await Promise.all(
        sentences.map(async (sentence) => {
          const emotionalScore = await this.analyzeEmotionalTone(sentence, options.emotionalTone);

          // Only adjust if the sentence doesn't match desired tone
          if (emotionalScore < CONFIDENCE_THRESHOLDS.MIN_EMOTIONAL_SCORE) {
            return this.adjustSentenceTone(sentence, options.emotionalTone);
          }
          return sentence;
        })
      );

      return adjustedSentences.join(" ");
    } catch {
      return text;
    }
  }

  private async analyzeEmotionalTone(sentence: string, targetTone: EmotionalTone): Promise<number> {
    const words = sentence.split(/\s+/);
    const scores = await Promise.all(
      words.map((word) => this.emotionalAnalyzer.analyzeSynonym({ word, score: 1, tags: [] }, targetTone, word))
    );

    // Calculate average score
    return scores.reduce((acc, score) => acc + score, 0) / scores.length;
  }

  private async adjustSentenceTone(sentence: string, targetTone: EmotionalTone): Promise<string> {
    const words = sentence.split(/\s+/);
    const transformedWords = await Promise.all(
      words.map(async (word) => {
        const score = await this.emotionalAnalyzer.analyzeSynonym({ word, score: 1, tags: [] }, targetTone, word);

        if (score < CONFIDENCE_THRESHOLDS.MIN_EMOTIONAL_SCORE) {
          const synonyms = await this.wordLevelTransformer.getSynonyms(word);
          if (synonyms.length > 0) {
            const bestSynonym = await this.findBestEmotionalMatch(synonyms, targetTone, word);
            return bestSynonym || word;
          }
        }
        return word;
      })
    );

    return transformedWords.join(" ");
  }

  private async findBestEmotionalMatch(
    synonyms: SynonymResult[],
    targetTone: EmotionalTone,
    originalWord: string
  ): Promise<string | null> {
    const scoredSynonyms = await Promise.all(
      synonyms.map(async (synonym) => ({
        word: synonym.word,
        score: await this.emotionalAnalyzer.analyzeSynonym(synonym, targetTone, originalWord),
      }))
    );

    const bestMatch = scoredSynonyms.reduce((best, current) => (current.score > best.score ? current : best), {
      word: "",
      score: 0,
    });

    return bestMatch.score > CONFIDENCE_THRESHOLDS.MIN_EMOTIONAL_SCORE ? bestMatch.word : null;
  }

  private calculateOverallConfidence(changes: Array<TransformationChange>): number {
    if (changes.length === 0) return 1;

    const weightedConfidences = changes.map((change) => {
      const weight = change.type === "word" ? 0.6 : 0.4;
      return change.confidence * weight;
    });

    return weightedConfidences.reduce((acc, conf) => acc * conf, 1);
  }

  private calculateConfidence(original: string, transformed: string, authenticityScore: AuthenticityScore): number {
    // Calculate Levenshtein distance
    const levenshteinScore = TransformationModels.weightedLevenshteinDistance(original, transformed, {
      insertion: 1,
      deletion: 1,
      substitution: 2,
    });

    // Calculate semantic similarity
    const semanticScore = this.calculateSemanticSimilarity(original, transformed);

    // Combine scores with weights
    const weights = {
      levenshtein: 0.3,
      semantic: 0.3,
      authenticity: 0.4,
    };

    return (
      weights.levenshtein * (1 - levenshteinScore / Math.max(original.length, transformed.length)) +
      weights.semantic * semanticScore +
      weights.authenticity * authenticityScore.overall
    );
  }

  private calculateSemanticSimilarity(original: string, transformed: string): number {
    const originalWords = new Set(original.toLowerCase().split(/\s+/));
    const transformedWords = new Set(transformed.toLowerCase().split(/\s+/));

    const intersection = new Set([...originalWords].filter((x) => transformedWords.has(x)));
    const union = new Set([...originalWords, ...transformedWords]);

    return intersection.size / union.size;
  }

  private applyMarkovTransformations(text: string, markovModel: Map<string, Map<string, number>>): string {
    const words = text.split(/\s+/);
    const transformedWords = words.map((word, index) => {
      if (index === 0) return word;

      const previousWord = words[index - 1];
      const transitions = markovModel.get(previousWord);

      if (transitions && transitions.size > 0) {
        const alternatives = Array.from(transitions.entries());
        const randomIndex = Math.floor(Math.random() * alternatives.length);
        return alternatives[randomIndex][0];
      }

      return word;
    });

    return transformedWords.join(" ");
  }

  private convertMatrixToMap(text: string, matrix: number[][]): Map<string, Map<string, number>> {
    const words = text.split(/\s+/);
    const uniqueWords = Array.from(new Set(words));
    const markovMap = new Map<string, Map<string, number>>();

    // Initialize the map for each unique word
    uniqueWords.forEach((word) => {
      markovMap.set(word, new Map());
    });

    // Fill in transition probabilities using word indices in uniqueWords array
    words.forEach((word, i) => {
      if (i < words.length - 1) {
        const nextWord = words[i + 1];
        const fromIndex = uniqueWords.indexOf(word);
        const toIndex = uniqueWords.indexOf(nextWord);

        if (fromIndex !== -1 && toIndex !== -1) {
          const probability = matrix[fromIndex][toIndex];
          markovMap.get(word)?.set(nextWord, probability);
        }
      }
    });

    return markovMap;
  }

  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
}
