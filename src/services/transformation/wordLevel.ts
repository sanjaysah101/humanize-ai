import { ISynonymProvider } from '@/core/interfaces/synonymProvider';
import { TransformationOptions } from '@/core/entities/transformation';

export class WordLevelTransformer {
  constructor(private synonymProvider: ISynonymProvider) {}

  async transform(text: string, options: TransformationOptions) {
    const words = text.split(/\s+/);
    const transformedWords = await Promise.all(
      words.map((word) => this.transformWord(word, options))
    );

    return {
      text: transformedWords.map((w) => w.replacement).join(' '),
      changes: transformedWords.filter((w) => w.replacement !== w.original),
    };
  }

  private async transformWord(word: string, options: TransformationOptions) {
    // Skip short words, numbers, and special characters
    if (
      word.length < 4 ||
      /^\d+$/.test(word) ||
      /[!@#$%^&*(),.?":{}|<>]/.test(word)
    ) {
      return {
        original: word,
        replacement: word,
        confidence: 1,
        type: 'word' as const,
      };
    }

    // Apply creativity threshold
    if (Math.random() > options.creativity) {
      return {
        original: word,
        replacement: word,
        confidence: 1,
        type: 'word' as const,
      };
    }

    try {
      const synonyms = await this.synonymProvider.getSynonyms(word);

      if (synonyms.length === 0) {
        return {
          original: word,
          replacement: word,
          confidence: 1,
          type: 'word' as const,
        };
      }

      // Filter and sort synonyms based on options
      const validSynonyms = synonyms
        .filter((syn) => syn.score > 0.6)
        .sort((a, b) => b.score - a.score);

      if (validSynonyms.length === 0) {
        return {
          original: word,
          replacement: word,
          confidence: 1,
          type: 'word' as const,
        };
      }

      // Select synonym based on creativity level
      const index = Math.floor(
        options.creativity * Math.min(validSynonyms.length - 1, 3)
      );
      const selected = validSynonyms[index];

      return {
        original: word,
        replacement: selected.word,
        confidence: selected.score,
        type: 'word' as const,
      };
    } catch (error) {
      console.log(error);
      return {
        original: word,
        replacement: word,
        confidence: 1,
        type: 'word' as const,
      };
    }
  }
}
