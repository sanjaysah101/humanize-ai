import nlp from "compromise";

import { TransformationChange, TransformationOptions } from "@/core/entities/transformation";
import { WordContext } from "@/core/entities/wordContext";
import { ISynonymProvider } from "@/core/interfaces/synonymProvider";
import { SynonymResult } from "@/core/interfaces/synonymProvider";
import { CONFIDENCE_THRESHOLDS } from "@/lib/constants/transformation";

import { SynonymSelector } from "./synonymSelector";

export class WordLevelTransformer {
  private synonymSelector: SynonymSelector;
  private nlpProcessor: typeof nlp;

  constructor(private synonymProvider: ISynonymProvider) {
    this.synonymSelector = new SynonymSelector();
    this.nlpProcessor = nlp;
  }

  async transform(text: string, options: TransformationOptions) {
    try {
      const doc = this.nlpProcessor(text);
      const sentences = doc.sentences().out("array");
      let transformedText = "";
      const changes: Array<TransformationChange> = [];

      for (const sentence of sentences) {
        const { transformedSentence, sentenceChanges } = await this.processSentence(sentence, options);

        transformedText += transformedSentence + " ";
        changes.push(...sentenceChanges);
      }

      return {
        text: transformedText.trim(),
        changes,
      };
    } catch {
      return {
        text: text,
        changes: [],
      };
    }
  }

  private async processSentence(sentence: string, options: TransformationOptions) {
    const words = sentence.split(/\s+/);
    const wordContexts = this.analyzeWordContexts(words);
    const sentenceChanges: Array<{
      original: string;
      replacement: string;
      type: "word";
      confidence: number;
    }> = [];

    // Transform words while preserving sentence structure
    const transformedWords = await Promise.all(
      wordContexts.map(async (context, index) => {
        const result = await this.transformWordWithContext(context, options, wordContexts, index);

        if (result.replacement !== result.original) {
          sentenceChanges.push({
            original: result.original,
            replacement: result.replacement,
            type: "word",
            confidence: result.confidence,
          });
        }

        return result.replacement;
      })
    );

    return {
      transformedSentence: transformedWords.join(" "),
      sentenceChanges,
    };
  }

  private analyzeWordContexts(words: string[]): WordContext[] {
    const doc = this.nlpProcessor(words.join(" "));

    return words.map((word, index) => ({
      word,
      previousWord: index > 0 ? words[index - 1] : null,
      nextWord: index < words.length - 1 ? words[index + 1] : null,
      pos: this.detectPartOfSpeech(doc, index),
      isImportantTerm: this.isImportantTerm(word),
    }));
  }

  private detectPartOfSpeech(doc: ReturnType<typeof nlp>, index: number): string {
    try {
      // Get terms and their tags in a type-safe way
      const terms = doc.json() as Array<{
        terms: Array<{
          tags: string[];
          text: string;
        }>;
      }>;

      const tags = terms[0]?.terms[index]?.tags || [];

      // Create a type-safe mapping of POS tags
      const posMapping: Record<string, string> = {
        Verb: "verb",
        Noun: "noun",
        Adjective: "adjective",
        Adverb: "adverb",
        Preposition: "preposition",
        Determiner: "determiner",
      };

      // Find the first matching POS tag
      const matchedPos = Object.entries(posMapping).find(([tag]) => tags.includes(tag));

      return matchedPos ? matchedPos[1] : "unknown";
    } catch {
      return "unknown";
    }
  }

  private isImportantTerm(word: string): boolean {
    const importantTerms = new Set([
      "api",
      "sdk",
      "url",
      "http",
      "https",
      "rest",
      "graphql",
      "json",
      "xml",
      "html",
      "css",
      "js",
      "npm",
      "git",
      "aws",
      "azure",
      "docker",
      "kubernetes",
      "sql",
      "nosql",
      "redis",
      "mongo",
      "postgres",
      "mysql",
    ]);
    return importantTerms.has(word.toLowerCase());
  }

  private async transformWordWithContext(
    context: WordContext,
    options: TransformationOptions,
    allContexts: WordContext[],
    currentIndex: number
  ): Promise<{ original: string; replacement: string; confidence: number }> {
    const { word, isImportantTerm } = context;

    // Early return for common words
    if (this.isCommonWord(word)) {
      return { original: word, replacement: word, confidence: 1 };
    }

    // Skip transformation if word length is too short
    if (word.length < 3) {
      return { original: word, replacement: word, confidence: 1 };
    }

    // Skip transformation if intent preservation is enabled and word is important
    if (options.preserveIntent && (isImportantTerm || this.isIntentCritical(context))) {
      return { original: word, replacement: word, confidence: 1 };
    }

    // Get synonyms with context
    const synonyms = await this.synonymProvider.getSynonyms(word);

    if (synonyms.length === 0) {
      return { original: word, replacement: word, confidence: 1 };
    }

    // Calculate context preservation scores for each synonym
    const scoredSynonyms = synonyms.map((synonym) => ({
      ...synonym,
      contextPreservationScore: this.getContextPreservationScore(synonym, context, options),
    }));

    // Rank synonyms based on context and options, including context preservation score
    const rankedSynonyms = await this.synonymSelector.rankSynonyms(scoredSynonyms, context, options);

    if (rankedSynonyms.length === 0) {
      return { original: word, replacement: word, confidence: 1 };
    }

    // Select best synonym considering surrounding context
    const selectedSynonym = await this.synonymSelector.selectBestSynonym(rankedSynonyms, options);

    const confidence = this.calculateConfidence(selectedSynonym, context, allContexts, currentIndex);

    return {
      original: word,
      replacement: selectedSynonym.word,
      confidence,
    };
  }

  private calculateConfidence(
    synonym: { word: string; score: number },
    context: WordContext,
    allContexts: WordContext[],
    currentIndex: number
  ): number {
    let confidence = synonym.score;

    // Adjust confidence based on POS matching
    if (context.pos !== "unknown") {
      confidence *= this.getPosMatchConfidence(synonym.word, context.pos);
    }

    // Adjust confidence based on surrounding context
    if (currentIndex > 0) {
      const previousContext = allContexts[currentIndex - 1];
      confidence *= this.getContextualConfidence(previousContext, "previous");
    }

    if (currentIndex < allContexts.length - 1) {
      const nextContext = allContexts[currentIndex + 1];
      confidence *= this.getContextualConfidence(nextContext, "next");
    }

    // Adjust confidence based on word importance
    if (context.isImportantTerm) {
      confidence *= 0.8; // Reduce confidence for important terms
    }

    // Check if the word is part of a common phrase
    if (this.isPartOfPhrase(context)) {
      confidence *= 0.7; // Reduce confidence for words in phrases
    }

    return Math.min(1, Math.max(CONFIDENCE_THRESHOLDS.MIN_CONFIDENCE, confidence));
  }

  private getPosMatchConfidence(word: string, pos: string): number {
    const doc = this.nlpProcessor(word);
    const wordPos = this.detectPartOfSpeech(doc, 0);

    // Higher confidence if part of speech matches
    return wordPos === pos ? 1.2 : 0.8;
  }

  private isPartOfPhrase(context: WordContext): boolean {
    const commonPhrases = [
      ["in", "order", "to"],
      ["as", "well", "as"],
      ["on", "the", "other", "hand"],
      ["in", "terms", "of"],
      // Add more common phrases as needed
    ];

    // Check if the word is part of any common phrase
    return commonPhrases.some((phrase) => {
      const phraseLength = phrase.length;
      for (let i = 0; i < phraseLength; i++) {
        if (phrase[i] === context.word) {
          // Check surrounding words
          const prevMatch = i === 0 || context.previousWord === phrase[i - 1];
          const nextMatch = i === phraseLength - 1 || context.nextWord === phrase[i + 1];
          return prevMatch && nextMatch;
        }
      }
      return false;
    });
  }

  private getContextualConfidence(context: WordContext, position: "previous" | "next"): number {
    if (context.isImportantTerm) return 0.9;
    if (context.pos === "preposition") return 0.95;
    if (context.pos === "determiner") return 0.95;

    // Use position to adjust confidence if needed
    const positionMultiplier = position === "previous" ? 0.95 : 0.9;
    return 1 * positionMultiplier;
  }

  private shouldSkipWord(word: string): boolean {
    return (
      word.length < 4 ||
      /^\d+$/.test(word) ||
      /[!@#$%^&*(),.?":{}|<>]/.test(word) ||
      /^[A-Z]+$/.test(word) ||
      this.isCommonWord(word)
    );
  }

  private isCommonWord(word: string): boolean {
    const commonWords = new Set([
      "the",
      "be",
      "to",
      "of",
      "and",
      "a",
      "in",
      "that",
      "have",
      "i",
      "it",
      "for",
      "not",
      "on",
      "with",
      "he",
      "as",
      "you",
      "do",
      "at",
    ]);
    return commonWords.has(word.toLowerCase());
  }

  private isIntentCritical(context: WordContext): boolean {
    const intentCriticalPos = new Set(["verb", "noun"]);
    const intentCriticalPatterns = [
      /^(must|should|will|can|may|might|could|would)$/i, // Modal verbs
      /^(not|never|always|sometimes)$/i, // Frequency/negation
      /^(if|unless|although|because|since|when)$/i, // Conditional/causal
    ];

    return intentCriticalPos.has(context.pos) || intentCriticalPatterns.some((pattern) => pattern.test(context.word));
  }

  private getContextPreservationScore(
    synonym: SynonymResult,
    context: WordContext,
    options: TransformationOptions
  ): number {
    const baseScore = this.calculateBaseContextScore(synonym, context);
    const grammarScore = this.calculateGrammarScore(synonym, context);
    const semanticScore = this.calculateSemanticScore(synonym, context);

    // Weight the scores based on contextPreservation level
    const weights = this.getContextWeights(options.contextPreservation);

    return baseScore * weights.base + grammarScore * weights.grammar + semanticScore * weights.semantic;
  }

  private calculateBaseContextScore(synonym: SynonymResult, context: WordContext): number {
    let score = 1;

    // Check part of speech match
    if (context.pos && synonym.tags) {
      score *= context.pos === this.getPrimaryPOS(synonym.tags) ? 1.2 : 0.8;
    }

    // Check surrounding words compatibility
    if (context.previousWord) {
      score *= this.checkCollocation(context.previousWord, synonym.word, "previous");
    }
    if (context.nextWord) {
      score *= this.checkCollocation(synonym.word, context.nextWord, "next");
    }

    return Math.min(1, Math.max(CONFIDENCE_THRESHOLDS.MIN_WORD_SCORE, score));
  }

  private calculateGrammarScore(synonym: SynonymResult, context: WordContext): number {
    const grammarPatterns = {
      preposition: {
        before: /^(in|on|at|to|for|with|by|from|of|about)$/i,
        after: /^(the|a|an|my|your|their|his|her|its)$/i,
      },
      article: {
        before: /^(the|a|an)$/i,
        after: /^[a-z]+$/i,
      },
      verb: {
        before: /^(to|will|shall|may|might|could|would|should|must|can)$/i,
        after: /^(the|a|an|my|your|their|his|her|its|this|that|these|those)$/i,
      },
    };

    let score = 1;
    const pos = this.getPrimaryPOS(synonym.tags || []);

    if (context.previousWord && grammarPatterns[pos as keyof typeof grammarPatterns]) {
      const pattern = grammarPatterns[pos as keyof typeof grammarPatterns].before;
      score *= pattern.test(context.previousWord) ? 1.2 : 0.9;
    }

    if (context.nextWord && grammarPatterns[pos as keyof typeof grammarPatterns]) {
      const pattern = grammarPatterns[pos as keyof typeof grammarPatterns].after;
      score *= pattern.test(context.nextWord) ? 1.2 : 0.9;
    }

    return Math.min(1, Math.max(CONFIDENCE_THRESHOLDS.MIN_WORD_SCORE, score));
  }

  private calculateSemanticScore(synonym: SynonymResult, context: WordContext): number {
    const doc = this.nlpProcessor(`${context.previousWord || ""} ${synonym.word} ${context.nextWord || ""}`);
    let score = 1;

    // Check for semantic coherence
    if (doc.has("#Plural") && !synonym.word.endsWith("s")) {
      score *= 0.8;
    }

    if (doc.has("#Singular") && synonym.word.endsWith("s")) {
      score *= 0.8;
    }

    // Check for tense consistency
    if (doc.has("#PastTense") && !synonym.tags?.includes("PastTense")) {
      score *= 0.8;
    }

    if (doc.has("#PresentTense") && !synonym.tags?.includes("PresentTense")) {
      score *= 0.8;
    }

    return Math.min(1, Math.max(CONFIDENCE_THRESHOLDS.MIN_WORD_SCORE, score));
  }

  private getContextWeights(contextPreservation: number): {
    base: number;
    grammar: number;
    semantic: number;
  } {
    if (contextPreservation >= 0.8) {
      return { base: 0.2, grammar: 0.4, semantic: 0.4 };
    }
    if (contextPreservation >= 0.5) {
      return { base: 0.3, grammar: 0.4, semantic: 0.3 };
    }
    return { base: 0.4, grammar: 0.3, semantic: 0.3 };
  }

  private checkCollocation(word1: string, word2: string, position: "previous" | "next"): number {
    // Define types for the collocation patterns
    type CollocationPatterns = {
      previous: { [key: string]: string[] };
      next: { [key: string]: string[] };
    };

    // Common collocations patterns with proper typing
    const commonPatterns: CollocationPatterns = {
      previous: {
        take: ["place", "care", "time", "advantage", "action"],
        make: ["sure", "sense", "progress", "money", "decision"],
        pay: ["attention", "respect", "tribute", "homage"],
      },
      next: {
        deeply: ["concerned", "involved", "committed", "affected"],
        highly: ["skilled", "qualified", "recommended", "regarded"],
        strongly: ["believe", "suggest", "recommend", "oppose"],
      },
    };

    const key = word1.toLowerCase();
    const patterns = position === "previous" ? commonPatterns.previous[key] : commonPatterns.next[key];

    if (patterns?.includes(word2.toLowerCase())) {
      return 1.2;
    }

    return 1;
  }

  private getPrimaryPOS(tags: string[]): string {
    const posHierarchy = ["Verb", "Noun", "Adjective", "Adverb", "Preposition", "Article"];
    return tags.find((tag) => posHierarchy.includes(tag)) || "unknown";
  }

  async getSynonyms(word: string): Promise<SynonymResult[]> {
    try {
      // Skip getting synonyms for words that should be skipped
      if (this.shouldSkipWord(word)) {
        return [];
      }

      // Get the part of speech for better synonym matching
      const doc = this.nlpProcessor(word);
      const pos = this.detectPartOfSpeech(doc, 0);

      // Get synonyms from the provider
      const synonyms = await this.synonymProvider.getSynonyms(word);

      // Filter synonyms based on part of speech if available
      return synonyms.map((syn) => ({
        ...syn,
        tags: syn.tags || [pos],
      }));
    } catch {
      return [];
    }
  }
}
