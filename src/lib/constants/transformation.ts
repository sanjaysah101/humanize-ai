export const CONFIDENCE_THRESHOLDS = {
  MIN_WORD_SCORE: 0.7,
  MIN_SYNTAX_SCORE: 0.8,
  MIN_EMOTIONAL_SCORE: 0.7,
  MIN_CONFIDENCE: 0.6,
  MIN_SENTENCE_SCORE: 0.7,
} as const;

export const CACHE_TTL = {
  SYNONYMS: 60 * 60 * 24, // 24 hours
  TRANSFORMATIONS: 60 * 60, // 1 hour
};

export const RATE_LIMITS = {
  REQUESTS_PER_MINUTE: 60,
  REQUESTS_PER_HOUR: 1000,
};

export const API_ENDPOINTS = {
  DATAMUSE: "https://api.datamuse.com",
  WORDS_API: "https://wordsapiv1.p.rapidapi.com",
};
