export interface EmotionalWord {
  word: string;
  tone: string;
  intensity: number; // 0-1
  formality: number; // 0-1
  tags: string[];
}

export const emotionalWordDictionary: Record<string, EmotionalWord> = {
  // Positive - Professional
  accomplish: {
    word: "accomplish",
    tone: "positive",
    intensity: 0.7,
    formality: 0.8,
    tags: ["achievement", "professional"],
  },
  achieve: {
    word: "achieve",
    tone: "positive",
    intensity: 0.7,
    formality: 0.8,
    tags: ["achievement", "professional"],
  },
  optimize: {
    word: "optimize",
    tone: "positive",
    intensity: 0.6,
    formality: 0.9,
    tags: ["improvement", "professional", "technical"],
  },

  // Positive - Casual
  awesome: {
    word: "awesome",
    tone: "positive",
    intensity: 0.8,
    formality: 0.3,
    tags: ["enthusiasm", "casual"],
  },
  great: {
    word: "great",
    tone: "positive",
    intensity: 0.7,
    formality: 0.5,
    tags: ["approval", "casual"],
  },

  // Negative - Professional
  challenge: {
    word: "challenge",
    tone: "negative",
    intensity: 0.5,
    formality: 0.8,
    tags: ["difficulty", "professional"],
  },
  concern: {
    word: "concern",
    tone: "negative",
    intensity: 0.4,
    formality: 0.8,
    tags: ["worry", "professional"],
  },

  // Negative - Casual
  bad: {
    word: "bad",
    tone: "negative",
    intensity: 0.6,
    formality: 0.4,
    tags: ["disapproval", "casual"],
  },
  awful: {
    word: "awful",
    tone: "negative",
    intensity: 0.8,
    formality: 0.3,
    tags: ["disapproval", "casual"],
  },

  // Neutral - Professional
  implement: {
    word: "implement",
    tone: "neutral",
    intensity: 0,
    formality: 0.9,
    tags: ["action", "professional", "technical"],
  },
  utilize: {
    word: "utilize",
    tone: "neutral",
    intensity: 0,
    formality: 0.9,
    tags: ["action", "professional"],
  },

  // Neutral - Casual
  use: {
    word: "use",
    tone: "neutral",
    intensity: 0,
    formality: 0.4,
    tags: ["action", "casual"],
  },
  get: {
    word: "get",
    tone: "neutral",
    intensity: 0,
    formality: 0.3,
    tags: ["action", "casual"],
  },
};
