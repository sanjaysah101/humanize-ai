import { ITransformer } from '@/core/interfaces/transformer';
import {
  TransformationOptions,
  TransformationResult,
} from '@/core/entities/transformation';
import { WordLevelTransformer } from './wordLevel';
import { SyntaxTransformer } from './syntax';
import { ISynonymProvider } from '@/core/interfaces/synonymProvider';

export class TextTransformer implements ITransformer {
  private wordLevelTransformer: WordLevelTransformer;
  private syntaxTransformer: SyntaxTransformer;

  constructor(synonymProvider: ISynonymProvider) {
    this.wordLevelTransformer = new WordLevelTransformer(synonymProvider);
    this.syntaxTransformer = new SyntaxTransformer();
  }

  async transform(
    text: string,
    options: TransformationOptions
  ): Promise<TransformationResult> {
    try {
      // Apply transformations in sequence
      const wordLevel = await this.wordLevelTransformer.transform(
        text,
        options
      );
      const syntax = this.syntaxTransformer.transform(wordLevel.text, options);

      return {
        originalText: text,
        transformedText: syntax.text || text, // Fallback to original text if no transformation
        confidence: this.calculateOverallConfidence([
          ...wordLevel.changes,
          ...syntax.changes,
        ]),
        transformations: [...wordLevel.changes, ...syntax.changes],
      };
    } catch (error) {
      console.log(error);
      // If transformation fails, return original text
      return {
        originalText: text,
        transformedText: text,
        confidence: 1,
        transformations: [],
      };
    }
  }

  private calculateOverallConfidence(
    changes: Array<{ confidence: number }>
  ): number {
    if (changes.length === 0) return 1;
    return changes.reduce((acc, change) => acc * change.confidence, 1);
  }
}
