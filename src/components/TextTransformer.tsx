import {
  humanizeText,
  restructureSentence,
  TransformationOptions,
} from '../utils/textUtils';
import { addTypingMistakes, addFillerWords } from '../utils/humanization';

const TextTransformer = async (
  input: string,
  options: TransformationOptions
): Promise<string> => {
  let result = await humanizeText(input, options);
  result = addTypingMistakes(result);
  result = addFillerWords(result);
  result = restructureSentence(result, options);
  return result;
};

export default TextTransformer;
