"use server";

import { TransformationOptions, TransformationResponse } from "@/core/entities/transformation";
import { TextTransformationUseCase } from "@/core/useCases/textTransformation";
import { DatamuseSynonymProvider } from "@/infrastructure/apis/datamuse";
import { MemoryCache } from "@/infrastructure/cache/memory";
import { TextTransformer } from "@/services/transformation";

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

    // Ensure we're returning string values, not objects
    return {
      success: true,
      data: {
        originalText: String(result.originalText),
        transformedText: String(result.transformedText),
        confidence: result.confidence,
        transformations: result.transformations.map((t) => ({
          original: String(t.original),
          replacement: String(t.replacement),
          type: t.type,
          confidence: t.confidence,
        })),
      },
    };
  } catch {
    return {
      success: false,
      error: "Failed to transform text",
    };
  }
};
