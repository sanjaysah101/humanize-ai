'use server';

import {
  humanizeText,
  restructureSentence,
  TransformationOptions,
} from '@/utils/textUtils';
import { addTypingMistakes, addFillerWords } from '@/utils/humanization';

export async function transformText(
  input: string,
  options: TransformationOptions
): Promise<string> {
  try {
    let result = await humanizeText(input, options);
    
    if (options.formality === 'informal') {
      result = addTypingMistakes(result);
      result = addFillerWords(result);
    }
    
    result = restructureSentence(result, options);
    return result;
  } catch (error) {
    console.error('Error in transformText:', error);
    return 'Error transforming text. Please try again.';
  }
} 