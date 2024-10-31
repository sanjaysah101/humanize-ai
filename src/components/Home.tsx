'use client';

import { useState } from 'react';
import { transformText } from '@/app/actions/text';
import {
  Textarea,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Label,
} from './ui';

export const Home = () => {
  const [inputText, setInputText] = useState<string>('');
  const [formality, setFormality] = useState<'informal' | 'formal'>('informal');
  const [outputText, setOutputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleTransform = async () => {
    setIsLoading(true);
    try {
      const result = await transformText(inputText, {
        formality,
        creativity: 0.3,
        preserveIntent: true,
      });
      setOutputText(result);
    } catch (error) {
      console.error('Error transforming text:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">AI Text Humanizer</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Column */}
        <div className="space-y-6">
          <div>
            <Label htmlFor="inputText" className="text-lg">
              Input Text
            </Label>
            <Textarea
              id="inputText"
              placeholder="Enter AI-generated text here"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="mt-2"
              rows={10}
            />
          </div>

          <div>
            <Label htmlFor="formality" className="text-lg">
              Formality
            </Label>
            <Select
              value={formality}
              onValueChange={(value) =>
                setFormality(value as 'informal' | 'formal')
              }
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select formality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="informal">Informal</SelectItem>
                <SelectItem value="formal">Formal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleTransform} disabled={isLoading}>
            {isLoading ? 'Transforming...' : 'Transform Text'}
          </Button>
        </div>

        {/* Output Column */}
        <div>
          <h3 className="text-2xl font-semibold mb-4">Humanized Output</h3>
          <div className="bg-gray-100 p-4 rounded-md whitespace-pre-wrap min-h-[200px]">
            {outputText}
          </div>
        </div>
      </div>
    </div>
  );
};
