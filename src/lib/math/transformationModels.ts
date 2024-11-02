import * as R from "ramda";

export class TransformationModels {
  /**
   * Implements Lambda Calculus for text transformation
   */
  static lambdaTransform(text: string, transformationFn: (s: string) => string): string {
    const transform = R.pipe(
      R.split(/\s+/), // Tokenize
      R.map(transformationFn), // Apply transformation
      R.filter(R.complement(R.isEmpty)), // Remove empty strings
      R.join(" ") // Join back to text
    );

    return transform(text);
  }

  /**
   * Calculates Levenshtein distance with weights
   */
  static weightedLevenshteinDistance(
    source: string,
    target: string,
    weights: { insertion: number; deletion: number; substitution: number }
  ): number {
    const matrix: number[][] = [];

    // Initialize matrix
    for (let i = 0; i <= source.length; i++) {
      matrix[i] = [i * weights.deletion];
    }
    for (let j = 0; j <= target.length; j++) {
      matrix[0][j] = j * weights.insertion;
    }

    // Fill matrix
    for (let i = 1; i <= source.length; i++) {
      for (let j = 1; j <= target.length; j++) {
        if (source[i - 1] === target[j - 1]) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + weights.substitution, // substitution
            matrix[i][j - 1] + weights.insertion, // insertion
            matrix[i - 1][j] + weights.deletion // deletion
          );
        }
      }
    }

    return matrix[source.length][target.length];
  }

  /**
   * Markov Chain model for word transitions
   */
  static markovTransitionMatrix(words: string[]): number[][] {
    // Create unique word list for state space
    const uniqueWords = Array.from(new Set(words));
    const n = uniqueWords.length;

    // Initialize matrix with zeros
    const matrix: number[][] = Array(n)
      .fill(null)
      .map(() => Array(n).fill(0));

    // Build transition counts
    const transitions = new Map<string, Map<string, number>>();

    // Initialize transitions map for each word
    uniqueWords.forEach((word) => {
      transitions.set(word, new Map());
    });

    // Count transitions
    for (let i = 0; i < words.length - 1; i++) {
      const fromWord = words[i];
      const toWord = words[i + 1];
      const stateTransitions = transitions.get(fromWord)!;
      stateTransitions.set(toWord, (stateTransitions.get(toWord) || 0) + 1);
    }

    // Calculate probabilities
    uniqueWords.forEach((fromWord, i) => {
      const stateTransitions = transitions.get(fromWord)!;
      const total = Array.from(stateTransitions.values()).reduce((sum, count) => sum + count, 0);

      uniqueWords.forEach((toWord, j) => {
        if (total > 0) {
          matrix[i][j] = (stateTransitions.get(toWord) || 0) / total;
        }
      });
    });

    return matrix;
  }
}
