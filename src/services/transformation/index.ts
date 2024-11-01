import { ITransformer } from '@/core/interfaces/transformer';
import {
  TransformationOptions,
  TransformationResult,
} from '@/core/entities/transformation';
import { WordLevelTransformer } from './wordLevel';
import { SyntaxTransformer } from './syntax';
import { ISynonymProvider } from '@/core/interfaces/synonymProvider';
import { CONFIDENCE_THRESHOLDS } from '../../lib/constants/transformation';
import { EmotionalToneAnalyzer } from '@/services/analysis/emotionalToneAnalyzer';
import { EmotionalTone } from '@/core/entities/transformation';
import { SynonymResult } from '@/core/interfaces/synonymProvider';
import { TransformationChange } from '@/core/entities/transformation';
import { TransformerModel } from '../ai/transformerModel';
import {
  AuthenticityScore,
  AuthenticityVerifier,
} from '../verification/authenticityVerifier';
import { TransformationModels } from '@/lib/math/transformationModels';

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

  async transform(
    text: string,
    options: TransformationOptions
  ): Promise<TransformationResult> {
    try {
      // First apply word-level transformations
      const wordLevelResult = await this.wordLevelTransformer.transform(
        text,
        options
      );

      // Then apply syntax transformations
      const syntaxResult = this.syntaxTransformer.transform(
        wordLevelResult.text,
        options
      );

      // Combine changes from both transformations
      const allChanges = [
        ...wordLevelResult.changes.map((change) => ({
          ...change,
          type: 'word' as const,
        })),
        ...syntaxResult.changes.map((change) => ({
          ...change,
          type: 'syntax' as const,
        })),
      ];

      // Calculate overall confidence from word and syntax changes
      const initialConfidence = this.calculateOverallConfidence(allChanges);

      // Apply emotional tone adjustments if needed
      const finalText =
        options.emotionalTone !== 'neutral'
          ? await this.adjustEmotionalTone(syntaxResult.text, options)
          : syntaxResult.text;

      // Apply initial transformation
      let transformedText = await this.transformerModel.generateHumanlikeText(
        finalText,
        options
      );

      // Verify authenticity
      const authenticityScore =
        await this.authenticityVerifier.verifyAuthenticity(transformedText);

      // Apply mathematical models if needed
      if (authenticityScore.overall < 0.85) {
        const markovModel =
          TransformationModels.markovTransitionMatrix(transformedText);
        // Apply Markov model transformations
        transformedText = this.applyMarkovTransformations(
          transformedText,
          markovModel
        );
      }

      // Calculate final confidence score combining all factors
      const finalConfidence =
        this.calculateConfidence(
          finalText,
          transformedText,
          authenticityScore
        ) * initialConfidence; // Multiply by initial confidence

      return {
        originalText: text,
        transformedText: transformedText,
        confidence: finalConfidence,
        transformations: allChanges,
      };
    } catch (error) {
      console.error('Transformation error:', error);
      return {
        originalText: text,
        transformedText: text,
        confidence: 1,
        transformations: [],
      };
    }
  }

  private async adjustEmotionalTone(
    text: string,
    options: TransformationOptions
  ): Promise<string> {
    try {
      const sentences = text.split(/(?<=[.!?])\s+/);
      const adjustedSentences = await Promise.all(
        sentences.map(async (sentence) => {
          const emotionalScore = await this.analyzeEmotionalTone(
            sentence,
            options.emotionalTone
          );

          // Only adjust if the sentence doesn't match desired tone
          if (emotionalScore < CONFIDENCE_THRESHOLDS.MIN_EMOTIONAL_SCORE) {
            return this.adjustSentenceTone(sentence, options.emotionalTone);
          }
          return sentence;
        })
      );

      return adjustedSentences.join(' ');
    } catch (error) {
      console.error('Emotional tone adjustment error:', error);
      return text;
    }
  }

  private async analyzeEmotionalTone(
    sentence: string,
    targetTone: EmotionalTone
  ): Promise<number> {
    const words = sentence.split(/\s+/);
    const scores = await Promise.all(
      words.map((word) =>
        this.emotionalAnalyzer.analyzeSynonym(
          { word, score: 1, tags: [] },
          targetTone,
          word
        )
      )
    );

    // Calculate average score
    return scores.reduce((acc, score) => acc + score, 0) / scores.length;
  }

  private async adjustSentenceTone(
    sentence: string,
    targetTone: EmotionalTone
  ): Promise<string> {
    const words = sentence.split(/\s+/);
    const transformedWords = await Promise.all(
      words.map(async (word) => {
        const score = await this.emotionalAnalyzer.analyzeSynonym(
          { word, score: 1, tags: [] },
          targetTone,
          word
        );

        if (score < CONFIDENCE_THRESHOLDS.MIN_EMOTIONAL_SCORE) {
          const synonyms = await this.wordLevelTransformer.getSynonyms(word);
          if (synonyms.length > 0) {
            const bestSynonym = await this.findBestEmotionalMatch(
              synonyms,
              targetTone,
              word
            );
            return bestSynonym || word;
          }
        }
        return word;
      })
    );

    return transformedWords.join(' ');
  }

  private async findBestEmotionalMatch(
    synonyms: SynonymResult[],
    targetTone: EmotionalTone,
    originalWord: string
  ): Promise<string | null> {
    const scoredSynonyms = await Promise.all(
      synonyms.map(async (synonym) => ({
        word: synonym.word,
        score: await this.emotionalAnalyzer.analyzeSynonym(
          synonym,
          targetTone,
          originalWord
        ),
      }))
    );

    const bestMatch = scoredSynonyms.reduce(
      (best, current) => (current.score > best.score ? current : best),
      { word: '', score: 0 }
    );

    return bestMatch.score > CONFIDENCE_THRESHOLDS.MIN_EMOTIONAL_SCORE
      ? bestMatch.word
      : null;
  }

  private calculateOverallConfidence(
    changes: Array<TransformationChange>
  ): number {
    if (changes.length === 0) return 1;

    const weightedConfidences = changes.map((change) => {
      const weight = change.type === 'word' ? 0.6 : 0.4;
      return change.confidence * weight;
    });

    return weightedConfidences.reduce((acc, conf) => acc * conf, 1);
  }

  private calculateConfidence(
    original: string,
    transformed: string,
    authenticityScore: AuthenticityScore
  ): number {
    const levenshteinDistance =
      TransformationModels.weightedLevenshteinDistance(original, transformed, {
        insertion: 1,
        deletion: 1,
        substitution: 2,
      });

    return (
      (authenticityScore.overall +
        (1 - levenshteinDistance / original.length)) /
      2
    );
  }

  private applyMarkovTransformations(
    text: string,
    markovModel: Map<string, Map<string, number>>
  ): string {
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

    return transformedWords.join(' ');
  }
}
