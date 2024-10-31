import { TransformationOptions } from '@/core/entities/transformation';

export class SyntaxTransformer {
  transform(text: string, options: TransformationOptions) {
    const sentences = this.splitIntoSentences(text);
    const transformedSentences = sentences.map(sentence => 
      this.transformSentence(sentence, options)
    );

    return {
      text: transformedSentences.map(t => t.text).join(' '),
      changes: transformedSentences
        .filter(t => t.original !== t.text)
        .map(t => ({
          original: t.original,
          replacement: t.text,
          type: 'syntax' as const,
          confidence: t.confidence
        }))
    };
  }

  private splitIntoSentences(text: string): string[] {
    return text.match(/[^.!?]+[.!?]+/g) || [text];
  }

  private transformSentence(sentence: string, options: TransformationOptions) {
    let transformed = sentence.trim();
    let confidence = 1;

    // Apply formality transformations
    if (options.formality === 'formal') {
      transformed = this.formalizeText(transformed);
      confidence *= 0.9;
    } else {
      transformed = this.casualizeText(transformed);
      confidence *= 0.9;
    }

    return {
      original: sentence,
      text: transformed,
      confidence
    };
  }

  private formalizeText(text: string): string {
    return text
      .replace(/don't/g, 'do not')
      .replace(/can't/g, 'cannot')
      .replace(/won't/g, 'will not')
      .replace(/n't/g, ' not')
      .replace(/['']re/g, ' are')
      .replace(/['']ve/g, ' have')
      .replace(/['']ll/g, ' will')
      .replace(/['']m/g, ' am');
  }

  private casualizeText(text: string): string {
    return text
      .replace(/do not/g, "don't")
      .replace(/cannot/g, "can't")
      .replace(/will not/g, "won't")
      .replace(/ are/g, "'re")
      .replace(/ have/g, "'ve")
      .replace(/ will/g, "'ll")
      .replace(/ am/g, "'m");
  }
} 