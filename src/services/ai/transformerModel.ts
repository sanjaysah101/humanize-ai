import { HfInference } from "@huggingface/inference";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/function";

import { EmotionalTone, TransformationOptions } from "@/core/entities/transformation";
import { TransformationModels } from "@/lib/math/transformationModels";

export class TransformerModel {
  private inference: HfInference;
  private modelId: string = "gpt2";
  private maxRetries = 3;
  private baseDelay = 2000;

  constructor() {
    if (!process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY) {
      throw new Error("HUGGINGFACE_API_KEY is not set");
    }
    this.inference = new HfInference(process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY);
  }

  async generateHumanLikeText(input: string, options: TransformationOptions): Promise<string> {
    let attempt = 0;
    let delay = this.baseDelay;

    const processText = (text: string) =>
      pipe(
        O.some(text.trim()),
        O.map((t) => (options.formality === "formal" ? this.formalizeText(t) : t)),
        O.map((t) => (options.emotionalTone !== "neutral" ? this.adjustTone(t, options.emotionalTone) : t)),
        O.map((t) => (options.creativity > 0.7 ? this.addCreativeVariations(t) : t)),
        O.map((t) => (options.preserveIntent ? this.ensureIntentPreservation(t, text) : t)),
        O.map((t) => this.postprocessText(t, input)),
        O.getOrElse(() => text)
      );

    while (attempt < this.maxRetries) {
      try {
        const response = await this.inference.textGeneration({
          model: this.modelId,
          inputs: input,
          parameters: {
            max_length: 150,
            temperature: Math.min(options.creativity, 0.8),
            top_p: 0.9,
            repetition_penalty: 1.2,
          },
        });

        const generatedText = response.generated_text;
        const similarity = this.calculateTextSimilarity(input, generatedText);

        if (similarity < 0.2) {
          const repairedText = this.repairGeneratedText(input, generatedText);
          const repairedSimilarity = this.calculateTextSimilarity(input, repairedText);

          if (repairedSimilarity >= 0.2) {
            return processText(repairedText);
          }

          attempt++;
          continue;
        }

        return processText(generatedText);
      } catch (error) {
        attempt++;
        if (error instanceof Error && error.message.includes("Rate limit")) {
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= 2;
          continue;
        }
        return processText(input);
      }
    }

    return processText(input);
  }

  private calculateTextSimilarity(text1: string, text2: string): number {
    const levenshteinSimilarity =
      1 -
      TransformationModels.weightedLevenshteinDistance(text1, text2, { insertion: 1, deletion: 1, substitution: 2 }) /
        Math.max(text1.length, text2.length);

    const semanticSimilarity = this.calculateSemanticSimilarity(text1, text2);

    // Combine both similarities with weights
    return 0.6 * levenshteinSimilarity + 0.4 * semanticSimilarity;
  }

  private calculateSemanticSimilarity(text1: string, text2: string): number {
    const originalWords = new Set(text1.toLowerCase().split(/\s+/));
    const transformedWords = new Set(text2.toLowerCase().split(/\s+/));

    const intersection = new Set([...originalWords].filter((x) => transformedWords.has(x)));
    const union = new Set([...originalWords, ...transformedWords]);

    return intersection.size / union.size;
  }

  private formalizeText(text: string): string {
    // Replace informal contractions
    const contractions = new Map([
      [/\b(can't)\b/gi, "cannot"],
      [/\b(won't)\b/gi, "will not"],
      [/\b(I'm)\b/gi, "I am"],
      [/\b(don't)\b/gi, "do not"],
      [/\b(isn't)\b/gi, "is not"],
    ]);

    let formalText = text;
    contractions.forEach((formal, informal) => {
      formalText = formalText.replace(informal, formal);
    });

    return formalText;
  }

  private adjustTone(text: string, tone: EmotionalTone): string {
    // Define type-safe tone modifiers
    const toneModifiers: Record<Exclude<EmotionalTone, "neutral">, Map<RegExp, string>> = {
      positive: new Map([
        [/\b(bad|poor|terrible)\b/gi, "challenging"],
        [/\b(problem|issue)\b/gi, "opportunity"],
        [/\b(failed|failing)\b/gi, "learned from"],
      ]),
      negative: new Map([
        [/\b(good|great|excellent)\b/gi, "acceptable"],
        [/\b(success|achievement)\b/gi, "result"],
        [/\b(improved|improving)\b/gi, "changed"],
      ]),
      professional: new Map([
        [/\b(think|believe)\b/gi, "assess"],
        [/\b(use|utilize)\b/gi, "implement"],
        [/\b(show|display)\b/gi, "demonstrate"],
      ]),
      casual: new Map([
        [/\b(implement|utilize)\b/gi, "use"],
        [/\b(demonstrate|exhibit)\b/gi, "show"],
        [/\b(assess|evaluate)\b/gi, "check"],
      ]),
    };

    // Return original text if tone is neutral
    if (tone === "neutral") {
      return text;
    }

    let modifiedText = text;
    const modifiers = toneModifiers[tone];
    modifiers.forEach((replacement, pattern) => {
      modifiedText = modifiedText.replace(pattern, replacement);
    });

    return modifiedText;
  }

  private addCreativeVariations(text: string): string {
    // Add creative variations while maintaining readability
    const sentences = text.split(/[.!?]+/).filter(Boolean);
    return sentences
      .map((sentence) => {
        if (Math.random() > 0.7) {
          // Add descriptive elements
          return this.addDescriptiveElements(sentence);
        }
        return sentence;
      })
      .join(". ");
  }

  private addDescriptiveElements(sentence: string): string {
    const descriptiveElements = ["Interestingly,", "Notably,", "Remarkably,", "Significantly,", "Essentially,"];
    const randomElement = descriptiveElements[Math.floor(Math.random() * descriptiveElements.length)];
    return `${randomElement} ${sentence}`;
  }

  private ensureIntentPreservation(processedText: string, originalText: string): string {
    // Extract key phrases from original text
    const keyPhrases = this.extractKeyPhrases(originalText);

    // Ensure key phrases are present in processed text
    let preservedText = processedText;
    keyPhrases.forEach((phrase) => {
      if (!preservedText.toLowerCase().includes(phrase.toLowerCase())) {
        preservedText = `${preservedText} ${phrase}`;
      }
    });

    return preservedText;
  }

  private extractKeyPhrases(text: string): string[] {
    // Simple key phrase extraction based on common patterns
    const phrases: string[] = [];

    // Extract phrases between quotes
    const quotedPhrases = text.match(/"([^"]+)"/g);
    if (quotedPhrases) {
      phrases.push(...quotedPhrases.map((p) => p.slice(1, -1)));
    }

    // Extract capitalized phrases
    const capitalizedPhrases = text.match(/[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g);
    if (capitalizedPhrases) {
      phrases.push(...capitalizedPhrases);
    }

    return [...new Set(phrases)]; // Remove duplicates
  }

  private postprocessText(text: string, originalText: string): string {
    if (text.length < originalText.length * 0.5 || text.length > originalText.length * 1.5) {
      return originalText;
    }
    return text;
  }

  private repairGeneratedText(originalText: string, generatedText: string): string {
    // Extract key phrases from original text
    const keyPhrases = this.extractKeyPhrases(originalText);

    // Ensure key phrases are preserved
    let repairedText = generatedText;
    keyPhrases.forEach((phrase) => {
      if (!repairedText.toLowerCase().includes(phrase.toLowerCase())) {
        repairedText = `${repairedText} ${phrase}`;
      }
    });

    // Ensure length is within bounds
    if (repairedText.length < originalText.length * 0.5) {
      repairedText = `${repairedText} ${originalText}`;
    } else if (repairedText.length > originalText.length * 1.5) {
      repairedText = repairedText.substring(0, Math.floor(originalText.length * 1.5));
    }

    return repairedText;
  }
}
