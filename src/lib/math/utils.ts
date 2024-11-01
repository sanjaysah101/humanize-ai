export class MathUtils {
  static calculateVariance(numbers: number[]): number {
    const mean = numbers.reduce((acc, val) => acc + val, 0) / numbers.length;
    const squareDiffs = numbers.map((value) => Math.pow(value - mean, 2));
    return Math.sqrt(
      squareDiffs.reduce((acc, val) => acc + val, 0) / numbers.length
    );
  }

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
}
