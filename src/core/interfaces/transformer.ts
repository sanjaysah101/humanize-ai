import { TransformationOptions, TransformationResult } from "../entities/transformation";

export interface ITransformer {
  transform(text: string, options: TransformationOptions): Promise<TransformationResult>;
}

export interface IWordTransformer {
  transform(
    text: string,
    options: TransformationOptions
  ): Promise<{
    text: string;
    changes: Array<{
      original: string;
      replacement: string;
      confidence: number;
    }>;
  }>;
}

export interface ISyntaxTransformer {
  transform(
    text: string,
    options: TransformationOptions
  ): {
    text: string;
    changes: Array<{
      original: string;
      replacement: string;
      confidence: number;
    }>;
  };
}
