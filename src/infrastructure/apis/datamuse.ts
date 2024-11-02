import { ICache } from "@/core/interfaces/cache";
import { ISynonymProvider } from "@/core/interfaces/synonymProvider";
import { SynonymResult } from "@/core/interfaces/synonymProvider";
import { CONFIDENCE_THRESHOLDS } from "@/lib/constants/transformation";

export class DatamuseSynonymProvider implements ISynonymProvider {
  private baseUrl = "https://api.datamuse.com/words";
  private cache: ICache;

  constructor(cache: ICache) {
    this.cache = cache;
  }

  async getSynonyms(word: string): Promise<SynonymResult[]> {
    try {
      // Check cache first
      const cached = await this.cache.get<string>(`synonym:${word}`);
      if (cached) {
        return JSON.parse(cached) as SynonymResult[];
      }

      const url = `${this.baseUrl}?rel_syn=${encodeURIComponent(word)}&md=p`;
      // Fetch from API if not cached
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Datamuse API error: ${response.statusText}`);
      }

      const data = await response.json();
      const synonyms = this.processApiResponse(data, word);

      // Cache the results
      await this.cache.set<string>(
        `synonym:${word}`,
        JSON.stringify(synonyms),
        60 * 60 // 1 hour cache
      );

      return synonyms;
    } catch {
      return [];
    }
  }

  private processApiResponse(
    data: Array<{ word: string; score: number; tags?: string[] }>,
    originalWord: string
  ): SynonymResult[] {
    return data
      .filter((item) => item.word !== originalWord && this.isValidSynonym(item.word))
      .map((item) => ({
        word: item.word,
        score: this.normalizeScore(item.score),
        tags: this.processTags(item.tags || []),
      }))
      .filter((syn) => syn.score >= CONFIDENCE_THRESHOLDS.MIN_WORD_SCORE);
  }

  private normalizeScore(score: number): number {
    // Datamuse scores typically range from 0 to ~100000
    const normalized = Math.min(score / 100000, 1);
    return Math.max(CONFIDENCE_THRESHOLDS.MIN_WORD_SCORE, normalized);
  }

  private processTags(tags: string[]): string[] {
    const tagMap: Record<string, string> = {
      n: "Noun",
      v: "Verb",
      adj: "Adjective",
      adv: "Adverb",
      prep: "Preposition",
    };

    return tags.map((tag) => tagMap[tag] || tag).filter((tag) => tag in tagMap);
  }

  private isValidSynonym(word: string): boolean {
    return (
      word.length > 1 &&
      !/[^a-zA-Z\-']/.test(word) && // Only letters, hyphens, and apostrophes
      !word.startsWith("-") &&
      !word.endsWith("-")
    );
  }
}
