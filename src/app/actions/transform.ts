"use server";

import { TransformationOptions, TransformationResponse } from "@/core/entities/transformation";
import { TextTransformationUseCase } from "@/core/useCases/textTransformation";
import { DatamuseSynonymProvider } from "@/infrastructure/apis/datamuse";
import { MemoryCache } from "@/infrastructure/cache/memory";
import { TextTransformer } from "@/services/transformation";

import { CONFIDENCE_THRESHOLDS } from "../../lib/constants/transformation";

// Initialize dependencies
const synonymProvider = new DatamuseSynonymProvider(new MemoryCache());
const transformer = new TextTransformer(synonymProvider);
const transformationUseCase = new TextTransformationUseCase(transformer, new MemoryCache());

export const transformText = async (text: string, options: TransformationOptions): Promise<TransformationResponse> => {
  if (!text || text.trim().length === 0) {
    return {
      success: false,
      error: "Please provide text to transform",
    };
  }

  try {
    const result = await transformationUseCase.transform(text, options);

    // Verify that transformations actually changed the text
    if (result.transformedText === text && result.transformations.length > 0) {
      // Apply transformations manually if they weren't applied
      let transformedText = text;
      for (const change of result.transformations) {
        if (change.confidence > CONFIDENCE_THRESHOLDS.MIN_WORD_SCORE) {
          const regex = new RegExp(`\\b${change.original}\\b`, "g");
          transformedText = transformedText.replace(regex, change.replacement);
        }
      }
      result.transformedText = transformedText;
    }

    return {
      success: true,
      data: {
        originalText: text.trim(),
        transformedText: result.transformedText.trim(),
        confidence: Math.max(0.3, result.confidence),
        transformations: result.transformations.filter((t) => t.confidence > 0.3),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to transform text",
    };
  }
};
