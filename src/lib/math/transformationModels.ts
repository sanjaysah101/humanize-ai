import { Matrix } from 'mathjs';

export class TransformationModels {
  /**
   * Implements Lambda Calculus for text transformation
   */
  static lambdaTransform(
    text: string,
    transformationFn: (s: string) => string
  ): string {
    return this.curry(transformationFn)(text);
  }

  /**
   * Calculates Levenshtein distance with weights
   */
  static weightedLevenshteinDistance(
    source: string,
    target: string,
    weights: { insertion: number; deletion: number; substitution: number }
  ): number {
    const matrix: number[][] = Array(source.length + 1)
      .fill(null)
      .map(() => Array(target.length + 1).fill(0));

    // Initialize matrix
    for (let i = 0; i <= source.length; i++) {
      matrix[i][0] = i * weights.deletion;
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
            matrix[i - 1][j - 1] + weights.substitution,
            matrix[i - 1][j] + weights.deletion,
            matrix[i][j - 1] + weights.insertion
          );
        }
      }
    }

    return matrix[source.length][target.length];
  }

  /**
   * Markov Chain model for word transitions
   */
  static markovTransitionMatrix(
    text: string,
    order: number = 1
  ): Map<string, Map<string, number>> {
    const words = text.split(/\s+/);
    const transitions = new Map<string, Map<string, number>>();

    for (let i = 0; i < words.length - order; i++) {
      const currentState = words.slice(i, i + order).join(' ');
      const nextWord = words[i + order];

      if (!transitions.has(currentState)) {
        transitions.set(currentState, new Map());
      }

      const stateTransitions = transitions.get(currentState)!;
      stateTransitions.set(
        nextWord,
        (stateTransitions.get(nextWord) || 0) + 1
      );
    }

    // Normalize probabilities
    for (const [state, stateTransitions] of transitions) {
      const total = Array.from(stateTransitions.values()).reduce(
        (sum, count) => sum + count,
        0
      );
      for (const [word, count] of stateTransitions) {
        stateTransitions.set(word, count / total);
      }
    }

    return transitions;
  }

  private static curry(fn: Function): Function {
    return function curried(...args: any[]) {
      if (args.length >= fn.length) {
        return fn.apply(this, args);
      }
      return function (...args2: any[]) {
        return curried.apply(this, args.concat(args2));
      };
    };
  }
} 