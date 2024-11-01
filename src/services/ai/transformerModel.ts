import { HfInference } from '@huggingface/inference';
import { TransformationOptions } from '@/core/entities/transformation';

export class TransformerModel {
  private inference: HfInference;
  private modelId: string = 'gpt2';

  constructor() {
    this.inference = new HfInference(process.env.HUGGINGFACE_API_KEY);
  }

  async generateHumanlikeText(
    input: string,
    options: TransformationOptions
  ): Promise<string> {
    try {
      const response = await this.inference.textGeneration({
        model: this.modelId,
        inputs: input,
        parameters: {
          max_length: 150,
          temperature: options.creativity,
          top_p: 0.9,
          repetition_penalty: 1.2,
        },
      });

      return response.generated_text;
    } catch (error) {
      console.error('Text generation error:', error);
      return input; // Return original text if generation fails
    }
  }
}
