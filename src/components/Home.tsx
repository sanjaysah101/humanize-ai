'use client';

import { useState, useTransition, useEffect } from 'react';
import {
  TransformationOptions,
  TransformationResponse,
  TransformationListItem,
} from '@/core/entities/transformation';
import { transformText } from '@/app/actions/transform';

export const Home = () => {
  const [mounted, setMounted] = useState(false);
  const [text, setText] = useState('');
  const [result, setResult] = useState<TransformationResponse | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setMounted(true);
  }, []);

  const defaultOptions: TransformationOptions = {
    formality: 'formal',
    creativity: 0.7,
    preserveIntent: true,
    emotionalTone: 'neutral',
    varietyLevel: 0.5,
    contextPreservation: 0.8,
  };

  const handleTransform = () => {
    startTransition(async () => {
      try {
        const response = await transformText(text, defaultOptions);
        setResult(response);
      } catch (error) {
        console.error('Error:', error);
        setResult({
          success: false,
          error: 'Failed to transform text',
        });
      }
    });
  };

  if (!mounted) {
    return null; // or a loading spinner
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Text Transformation Test</h1>

      <div className="space-y-4">
        <div>
          <label className="block mb-2" htmlFor="inputText">
            Input Text:
          </label>
          <textarea
            id="inputText"
            className="w-full p-2 border rounded-md"
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text to transform..."
          />
        </div>

        <button
          type="button"
          onClick={handleTransform}
          disabled={isPending || !text}
          className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-300"
        >
          {isPending ? 'Transforming...' : 'Transform Text'}
        </button>

        {result && mounted && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">Result:</h2>
            <div className="bg-gray-50 p-4 rounded-md">
              {result.success && result.data && (
                <>
                  <div className="mb-4">
                    <h3 className="font-medium">Transformed Text:</h3>
                    <p className="mt-1">{result.data.transformedText}</p>
                  </div>

                  {result.data.transformations.length > 0 && (
                    <div>
                      <h3 className="font-medium">Transformations:</h3>
                      <ul className="mt-1 space-y-1">
                        {result.data.transformations.map(
                          (t: TransformationListItem, i: number) => (
                            <li key={`transform-${i}`} className="text-sm">
                              {t.original} → {t.replacement} ({t.type},
                              confidence: {t.confidence.toFixed(2)})
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
                </>
              )}

              {!result.success && result.error && (
                <div className="text-red-500">Error: {result.error}</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
