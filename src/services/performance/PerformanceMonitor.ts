import memoryUsage from "memory-usage";
import now from "performance-now";

import { TransformationOptions, TransformationResult } from "../../core/entities/transformation";
import { TextTransformer } from "../transformation";

export class PerformanceMonitor {
  static async measureTransformation(
    transformer: TextTransformer,
    text: string,
    options: TransformationOptions
  ): Promise<{ result: TransformationResult; metrics: PerformanceMetrics }> {
    const startTime = now();
    const startMemory = await memoryUsage();

    const result = await transformer.transform(text, options);

    const endTime = now();
    const endMemory = await memoryUsage();

    return {
      result,
      metrics: {
        executionTime: endTime - startTime,
        memoryUsage: endMemory - startMemory,
        transformationCount: result.transformations.length,
      },
    };
  }
}
