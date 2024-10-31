declare module '@nlpjs/similarity' {
    export function similarWords(word: string): Promise<Array<{
        word: string;
        similarity: number;
    }>>;

    export function levenshtein(a: string, b: string): number;
    export function diceCoefficient(a: string, b: string): number;
    export function jaroWinkler(a: string, b: string): number;
} 