import { TransformationOptions, TransformationResult } from '../entities/transformation';

export interface ITransformer {
  transform(text: string, options: TransformationOptions): Promise<TransformationResult>;
} 