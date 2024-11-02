import nlp from "compromise";
import sentences from "compromise-sentences";
import natural from "natural";

import { TransformationChange, TransformationOptions } from "@/core/entities/transformation";
import { CONFIDENCE_THRESHOLDS } from "@/lib/constants/transformation";

nlp.extend(sentences);

export class SyntaxTransformer {
  private tokenizer: natural.WordTokenizer;
  private tagger: natural.BrillPOSTagger;
  private nlpProcessor: typeof nlp;

  constructor() {
    this.tokenizer = new natural.WordTokenizer();

    // Create lexicon with default category
    const lexicon = new natural.Lexicon("EN", "NN", "NNP");

    // Create ruleset for English
    const ruleSet = new natural.RuleSet("EN");

    // Initialize tagger with lexicon and ruleset
    this.tagger = new natural.BrillPOSTagger(lexicon, ruleSet);

    this.nlpProcessor = nlp;
  }

  transform(text: string, options: TransformationOptions) {
    const doc = nlp(text);
    const tokens = this.tokenizer.tokenize(text);
    const taggedSentence = this.tagger.tag(tokens);

    // Extract tags from the Sentence object
    const tagged = taggedSentence.taggedWords.map((word) => word.tag);

    return {
      text: this.applyTransformations(doc, tagged, options),
      confidence: this.calculateConfidence(tagged),
      changes: this.trackChanges(doc, tagged),
    };
  }

  private applyTransformations(doc: ReturnType<typeof nlp>, tagged: string[], options: TransformationOptions): string {
    let transformedText = doc.text();
    const sentences = doc.sentences().out("array");

    // Apply transformations with more conservative thresholds
    if (options.formality === "formal") {
      transformedText = this.applyFormalTransformations(sentences, tagged);
    } else if (options.formality === "informal") {
      transformedText = this.applyInformalTransformations(sentences, tagged);
    }

    // Only apply voice transformations if explicitly requested and confidence is high
    if (options.contextPreservation < 0.3) {
      // More conservative threshold
      const passiveResult = this.transformToPassiveVoice(transformedText);
      if (passiveResult.confidence > 0.8) {
        // Only apply if confidence is high
        transformedText = passiveResult.text;
      }
    }

    return transformedText;
  }

  private calculateConfidence(tagged: string[]): number {
    // Calculate confidence based on successful POS tagging
    const validTags = tagged.filter((tag) => tag !== "unknown").length;
    const confidence = validTags / tagged.length;

    return Math.max(confidence, CONFIDENCE_THRESHOLDS.MIN_SYNTAX_SCORE);
  }

  private trackChanges(doc: ReturnType<typeof nlp>, tagged: string[]): TransformationChange[] {
    const changes: TransformationChange[] = [];
    const sentences = doc.sentences().out("array");

    sentences.forEach((sentence: string, index: number) => {
      const original = sentence;
      const transformed = this.applySentenceTransformation(this.nlpProcessor(sentence), tagged);

      if (original !== transformed) {
        changes.push({
          original,
          replacement: transformed,
          type: "syntax",
          confidence: this.calculateSentenceConfidence(tagged, index),
        });
      }
    });

    return changes;
  }

  private calculateSentenceConfidence(tagged: string[], sentenceIndex: number): number {
    const sentenceTags = tagged.slice(
      sentenceIndex * 10, // Approximate words per sentence
      (sentenceIndex + 1) * 10
    );

    const validTags = sentenceTags.filter((tag) => tag !== "unknown").length;
    return Math.max(validTags / sentenceTags.length, CONFIDENCE_THRESHOLDS.MIN_SENTENCE_SCORE);
  }

  private applySentenceTransformation(sentence: ReturnType<typeof nlp>, tagged: string[]): string {
    const terms = sentence.terms().out("array");
    const transformedTerms = terms.map((term: string, index: number) => {
      const tag = tagged[index];
      return this.transformTerm(term, tag);
    });

    return transformedTerms.join(" ");
  }

  private transformTerm(term: string, tag: string): string {
    // Apply specific transformations based on POS tag
    switch (tag) {
      case "VB": // Verb
        return this.transformVerb(term);
      case "JJ": // Adjective
        return this.transformAdjective(term);
      case "RB": // Adverb
        return this.transformAdverb(term);
      default:
        return term;
    }
  }

  private transformVerb(verb: string): string {
    const irregularVerbs = new Map([
      ["am", "are"],
      ["is", "are"],
      ["was", "were"],
      ["has", "have"],
      ["does", "do"],
    ]);

    return irregularVerbs.get(verb.toLowerCase()) || verb;
  }

  private transformAdjective(adjective: string): string {
    const formalAdjectives = new Map([
      ["good", "excellent"],
      ["bad", "unfavorable"],
      ["big", "substantial"],
      ["small", "minimal"],
    ]);

    return formalAdjectives.get(adjective.toLowerCase()) || adjective;
  }

  private transformAdverb(adverb: string): string {
    const formalAdverbs = new Map([
      ["really", "significantly"],
      ["very", "substantially"],
      ["just", "precisely"],
      ["maybe", "potentially"],
    ]);

    return formalAdverbs.get(adverb.toLowerCase()) || adverb;
  }

  private applyFormalTransformations(sentences: string[], tagged: string[]): string {
    return sentences
      .map((sentence) => {
        const terms = this.nlpProcessor(sentence).terms().out("array");
        return terms
          .map((term: string, index: number) => {
            const tag = tagged[index];
            const formal = this.getFormalEquivalent(term, tag);
            return formal || term;
          })
          .join(" ");
      })
      .join(". ");
  }

  private applyInformalTransformations(sentences: string[], tagged: string[]): string {
    return sentences
      .map((sentence) => {
        const terms = this.nlpProcessor(sentence).terms().out("array");
        return terms
          .map((term: string, index: number) => {
            const tag = tagged[index];
            const informal = this.getInformalEquivalent(term, tag);
            return informal || term;
          })
          .join(" ");
      })
      .join(". ");
  }

  private getFormalEquivalent(term: string, tag: string): string | null {
    // Formal equivalents organized by POS tag
    const formalEquivalents = new Map([
      // Verbs (VB*)
      ["get", { word: "obtain", tags: ["VB", "VBP", "VBZ"] }],
      ["use", { word: "utilize", tags: ["VB", "VBP", "VBZ"] }],
      ["show", { word: "demonstrate", tags: ["VB", "VBP", "VBZ"] }],
      ["help", { word: "assist", tags: ["VB", "VBP", "VBZ"] }],

      // Adjectives (JJ)
      ["good", { word: "excellent", tags: ["JJ"] }],
      ["bad", { word: "unfavorable", tags: ["JJ"] }],
      ["big", { word: "substantial", tags: ["JJ"] }],
      ["small", { word: "minimal", tags: ["JJ"] }],

      // Adverbs (RB)
      ["really", { word: "significantly", tags: ["RB"] }],
      ["very", { word: "substantially", tags: ["RB"] }],
    ]);

    const equivalent = formalEquivalents.get(term.toLowerCase());
    if (equivalent && equivalent.tags.includes(tag)) {
      return equivalent.word;
    }

    return null;
  }

  private getInformalEquivalent(term: string, tag: string): string | null {
    const informalEquivalents = new Map([
      // Verbs (VB*)
      ["obtain", { word: "get", tags: ["VB", "VBP", "VBZ"] }],
      ["utilize", { word: "use", tags: ["VB", "VBP", "VBZ"] }],
      ["demonstrate", { word: "show", tags: ["VB", "VBP", "VBZ"] }],
      ["assist", { word: "help", tags: ["VB", "VBP", "VBZ"] }],

      // Adjectives (JJ)
      ["excellent", { word: "good", tags: ["JJ"] }],
      ["substantial", { word: "big", tags: ["JJ"] }],

      // Adverbs (RB)
      ["significantly", { word: "really", tags: ["RB"] }],
      ["substantially", { word: "very", tags: ["RB"] }],
    ]);

    const equivalent = informalEquivalents.get(term.toLowerCase());
    if (equivalent && equivalent.tags.includes(tag)) {
      return equivalent.word;
    }

    return null;
  }

  private transformToPassiveVoice(text: string): { text: string; confidence: number } {
    const doc = nlp(text);
    let confidence = 1;
    let transformedText = text;

    // Limit the number of sentences to transform
    let transformCount = 0;
    const maxTransforms = 2; // Only transform up to 2 sentences

    doc.sentences().forEach((sentence) => {
      if (transformCount >= maxTransforms) return;

      const subject = sentence.match("#Subject").text();
      const verb = sentence.match("#Verb").text();
      const object = sentence.match("#Object").text();

      if (subject && verb && object) {
        // Only transform if all parts are present and sentence is not too complex
        if (sentence.terms().length < 10) {
          const baseVerb = this.nlpProcessor(verb).verbs().toInfinitive().text();
          const pastParticiple = this.getPastParticiple(baseVerb);
          const passiveForm = `${object} ${this.getBeForm(verb)} ${pastParticiple} by ${subject}`;
          transformedText = transformedText.replace(sentence.text(), passiveForm);
          confidence *= 0.9;
          transformCount++;
        }
      }
    });

    return { text: transformedText, confidence };
  }

  private getPastParticiple(verb: string): string {
    const irregularParticiples = new Map([
      ["be", "been"],
      ["do", "done"],
      ["go", "gone"],
      ["see", "seen"],
      ["take", "taken"],
    ]);

    const participle = irregularParticiples.get(verb.toLowerCase());
    if (participle) return participle;

    // Regular verb rules
    if (verb.endsWith("e")) return verb + "d";
    if (verb.match(/[aeiou][bcdfghjklmnpqrstvwxz]$/)) {
      return verb + verb.slice(-1) + "ed";
    }
    return verb + "ed";
  }

  private getBeForm(verb: string): string {
    const doc = this.nlpProcessor(verb);
    if (doc.has("#PastTense")) return "was";
    if (doc.has("#PresentTense")) return "is";
    if (doc.has("#FutureTense")) return "will be";
    return "is";
  }
}
