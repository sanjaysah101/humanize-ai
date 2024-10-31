import {
  ISynonymProvider,
  SynonymResult,
} from '@/core/interfaces/synonymProvider';

export class DatamuseSynonymProvider implements ISynonymProvider {
  private readonly baseUrl = 'https://api.datamuse.com/words';
  private lastCallTime: number = 0;
  private readonly minCallInterval = 100; // milliseconds

  async getSynonyms(word: string): Promise<SynonymResult[]> {
    // Rate limiting
    await this.throttle();

    try {
      const response = await fetch(
        `${this.baseUrl}?rel=syn&word=${encodeURIComponent(word)}`
      );

      if (!response.ok) {
        throw new Error(`Datamuse API error: ${response.statusText}`);
      }

      const data = await response.json();

      return data.map(
        (item: { word: string; score: number; tags?: string[] }) => ({
          word: item.word,
          score: item.score / 100000, // Normalize score to 0-1
          tags: item.tags,
        })
      );
    } catch (error) {
      console.error('Datamuse API error:', error);
      return [];
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}?rel=syn&word=test`);
      return response.ok;
    } catch {
      return false;
    }
  }

  private async throttle(): Promise<void> {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastCallTime;

    if (timeSinceLastCall < this.minCallInterval) {
      await new Promise((resolve) =>
        setTimeout(resolve, this.minCallInterval - timeSinceLastCall)
      );
    }

    this.lastCallTime = Date.now();
  }
}
