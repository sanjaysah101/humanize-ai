import nlp from 'compromise';

export interface TransformationOptions {
  formality: 'informal' | 'formal';
  creativity: number;
  preserveIntent: boolean;
}

const commonSynonyms: Record<string, string[]> = {
  good: ['great', 'excellent', 'fantastic', 'wonderful'],
  bad: ['poor', 'terrible', 'awful', 'horrible'],
  big: ['large', 'huge', 'enormous', 'massive'],
  small: ['tiny', 'little', 'miniature', 'compact'],
  // Add more common words and their synonyms as needed
};

function findSimilarWord(word: string): string {
  const lowercaseWord = word.toLowerCase();
  const synonyms = commonSynonyms[lowercaseWord];

  if (synonyms && synonyms.length > 0) {
    return synonyms[Math.floor(Math.random() * synonyms.length)];
  }

  return word;
}

export async function humanizeText(
  text: string,
  options: TransformationOptions
): Promise<string> {
  const doc = nlp(text);
  const sentences = doc.sentences().out('array');
  let modifiedText = '';

  for (const sentence of sentences) {
    const words = sentence.toString().split(' ');
    const modifiedWords = words.map((word: string) => {
      if (Math.random() < options.creativity) {
        return findSimilarWord(word);
      }
      return word;
    });

    modifiedText += modifiedWords.join(' ') + '. ';
  }

  return modifiedText.trim();
}

export function restructureSentence(
  text: string,
  options: TransformationOptions
): string {
  const doc = nlp(text);

  if (options.formality === 'informal') {
    // Convert to contractions for informal tone
    doc.contractions().expand();
  } else {
    // Expand contractions for formal tone
    doc.contractions().expand();
  }

  return doc.text();
}
