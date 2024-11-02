import { TransformationOptions, TransformationResult } from "../entities/transformation";
import { ICache } from "../interfaces/cache";
import { ITransformer } from "../interfaces/transformer";

export class TextTransformationUseCase {
  constructor(
    private readonly transformer: ITransformer,
    private readonly cache: ICache
  ) {}

  async transform(text: string, options: TransformationOptions): Promise<TransformationResult> {
    // Try to get from cache first
    const cacheKey = this.generateCacheKey(text, options);
    const cachedResult = await this.cache.get<TransformationResult>(cacheKey);

    if (cachedResult) {
      return cachedResult;
    }

    // Perform transformation
    const result = await this.transformer.transform(text, options);

    // Cache the result
    await this.cache.set(cacheKey, result, 3600); // 1 hour TTL

    return result;
  }

  private generateCacheKey(text: string, options: TransformationOptions): string {
    return `transform:${Buffer.from(text).toString("base64")}:${JSON.stringify(options)}`;
  }
}
