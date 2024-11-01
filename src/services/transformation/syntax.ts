import { TransformationOptions } from '@/core/entities/transformation';
import { CONFIDENCE_THRESHOLDS } from '@/lib/constants/transformation';
import nlp from 'compromise';

interface NlpTerm {
  text: string;
  tags: string[];
  normal?: string;
  implicit?: string;
}

export class SyntaxTransformer {
  private nlpProcessor: typeof nlp;

  constructor() {
    this.nlpProcessor = nlp;
  }

  transform(text: string, options: TransformationOptions) {
    const sentences = this.splitIntoSentences(text);
    const transformedSentences = sentences.map((sentence: string) =>
      this.transformSentence(sentence, options)
    );

    return {
      text: transformedSentences.map((t) => t.text).join(' '),
      changes: transformedSentences
        .filter((t) => t.original !== t.text)
        .map((t) => ({
          original: t.original,
          replacement: t.text,
          type: 'syntax' as const,
          confidence: t.confidence,
        })),
    };
  }

  private transformSentence(
    sentence: string,
    options: TransformationOptions
  ): { original: string; text: string; confidence: number } {
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

    // Apply voice transformations based on formality
    if (options.formality === 'formal') {
      const voiceResult = this.transformToPassiveVoice(transformed);
      transformed = voiceResult.text;
      confidence *= voiceResult.confidence;
    } else {
      const voiceResult = this.transformToActiveVoice(transformed);
      transformed = voiceResult.text;
      confidence *= voiceResult.confidence;
    }

    // Apply sentence structure transformations
    const structureResult = this.transformSentenceStructure(
      transformed,
      options
    );
    transformed = structureResult.text;
    confidence *= structureResult.confidence;

    return {
      original: sentence,
      text: transformed,
      confidence: Math.max(
        confidence,
        CONFIDENCE_THRESHOLDS.MIN_SENTENCE_SCORE
      ),
    };
  }

  private transformToPassiveVoice(text: string): {
    text: string;
    confidence: number;
  } {
    const doc = this.nlpProcessor(text);
    let confidence = 1;

    // Transform active voice to passive voice
    if (doc.has('#ActiveVoice')) {
      const terms = doc.json()[0]?.terms || [];
      const subject =
        terms.find((t: NlpTerm) => t.tags.includes('Subject'))?.text || '';
      const verb =
        terms.find((t: NlpTerm) => t.tags.includes('Verb'))?.text || '';
      const object =
        terms.find((t: NlpTerm) => t.tags.includes('Object'))?.text || '';

      if (subject && verb && object) {
        const passiveVerb = this.getPassiveForm(verb);
        text = `${object} ${passiveVerb} by ${subject}`;
        confidence *= 0.8;
      }
    }

    return { text, confidence };
  }

  private transformToActiveVoice(text: string): {
    text: string;
    confidence: number;
  } {
    const doc = this.nlpProcessor(text);
    let confidence = 1;

    // Transform passive voice to active voice
    if (doc.has('#PassiveVoice')) {
      const matches = text.match(/(.+) (?:is|are|was|were) (.+) by (.+)/i);
      if (matches) {
        const [, object, participle, subject] = matches;
        const activeVerb = this.getActiveForm(participle);
        text = `${subject} ${activeVerb} ${object}`;
        confidence *= 0.8;
      }
    }

    return { text, confidence };
  }

  private transformSentenceStructure(
    text: string,
    options: TransformationOptions
  ): { text: string; confidence: number } {
    const doc = this.nlpProcessor(text);
    let confidence = 1;

    // Apply different sentence structures based on formality and creativity
    if (options.formality === 'formal' && options.creativity > 0.7) {
      // Complex sentence structures for formal, creative text
      text = this.applyComplexStructure(doc);
      confidence *= 0.7;
    } else if (options.formality === 'informal' && options.creativity < 0.3) {
      // Simple sentence structures for informal, less creative text
      text = this.applySimpleStructure(doc);
      confidence *= 0.9;
    }

    return { text, confidence };
  }

  private getPassiveForm(verb: string): string {
    const irregularVerbs: Record<string, string> = {
      take: 'taken',
      give: 'given',
      write: 'written',
      break: 'broken',
      // Add more irregular verbs as needed
    };

    if (irregularVerbs[verb]) {
      return `is ${irregularVerbs[verb]}`;
    }

    // Regular verbs
    return `is ${verb}ed`;
  }

  private getActiveForm(participle: string): string {
    const irregularForms: Record<string, string> = {
      taken: 'takes',
      given: 'gives',
      written: 'writes',
      broken: 'breaks',
      // Add more irregular forms as needed
    };

    return irregularForms[participle] || participle.replace(/ed$/, 's');
  }

  private applyComplexStructure(doc: ReturnType<typeof nlp>): string {
    // Implement complex sentence structure transformations
    // This is a placeholder implementation
    return doc.text();
  }

  private applySimpleStructure(doc: ReturnType<typeof nlp>): string {
    // Implement simple sentence structure transformations
    // This is a placeholder implementation
    return doc.text();
  }

  private splitIntoSentences(text: string): string[] {
    return text.match(/[^.!?]+[.!?]+/g) || [text];
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
      .replace(/['']m/g, ' am')
      .replace(/gonna/g, 'going to')
      .replace(/wanna/g, 'want to')
      .replace(/gotta/g, 'got to')
      .replace(/dunno/g, 'do not know')
      .replace(/y'all/g, 'you all');
  }

  private casualizeText(text: string): string {
    return text
      .replace(
        /\b(do|does|did|have|has|had|would|will|is|are|am) not\b/g,
        "$1n't"
      )
      .replace(/\b(I am)\b/g, "I'm")
      .replace(/\b(you|we|they) are\b/g, "$1're")
      .replace(/\b(I|you|we|they) have\b/g, "$1've")
      .replace(/\b(I|you|we|they) will\b/g, "$1'll")
      .replace(/going to\b/g, 'gonna')
      .replace(/want to\b/g, 'wanna')
      .replace(/got to\b/g, 'gotta')
      .replace(/do not know\b/g, 'dunno')
      .replace(/you all\b/g, "y'all");
  }
}
