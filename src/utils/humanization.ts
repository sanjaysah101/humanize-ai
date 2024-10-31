interface TypingPattern {
  pattern: string;
  replacement: string;
  probability: number;
}

const typingPatterns: TypingPattern[] = [
  { pattern: 'th', replacement: 'ht', probability: 0.05 },
  { pattern: 'ie', replacement: 'ei', probability: 0.05 },
  { pattern: 'er', replacement: 're', probability: 0.05 },
];

const fillerWords = [
  'like',
  'um',
  'uh',
  'you know',
  'actually',
  'basically',
  'literally',
];

export function addTypingMistakes(text: string): string {
  let result = text;
  typingPatterns.forEach(({ pattern, replacement, probability }) => {
    if (Math.random() < probability) {
      result = result.replace(new RegExp(pattern, 'g'), replacement);
    }
  });
  return result;
}

export function addFillerWords(text: string): string {
  const sentences = text.split('. ');
  return sentences
    .map(sentence => {
      if (Math.random() < 0.3) {
        const filler = fillerWords[Math.floor(Math.random() * fillerWords.length)];
        return `${filler}, ${sentence}`;
      }
      return sentence;
    })
    .join('. ');
} 