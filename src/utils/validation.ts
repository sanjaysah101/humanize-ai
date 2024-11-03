const COMMON_WORDS = new Set([
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

export const TEXT_VALIDATION = {
  MIN_WORDS: 5,
  MIN_CHARS: 20,
  MAX_CHARS: 5000,
} as const;

export const validateTransformText = (text: string): { isValid: boolean; error?: string } => {
  const trimmedText = text.trim();
  const words = trimmedText.split(/\s+/);

  if (trimmedText.length < TEXT_VALIDATION.MIN_CHARS) {
    return {
      isValid: false,
      error: `Text must be at least ${TEXT_VALIDATION.MIN_CHARS} characters long`,
    };
  }

  if (words.length < TEXT_VALIDATION.MIN_WORDS) {
    return {
      isValid: false,
      error: `Text must contain at least ${TEXT_VALIDATION.MIN_WORDS} words`,
    };
  }

  if (words.every((word) => COMMON_WORDS.has(word.toLowerCase()))) {
    return {
      isValid: false,
      error: "Text contains only common words. Please add more meaningful content",
    };
  }

  return { isValid: true };
};
