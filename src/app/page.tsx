"use client";

import { useState, useTransition } from "react";

import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea } from "@/components/ui";
import { EmotionalTone, TransformationOptions, TransformationResponse } from "@/core/entities/transformation";

const emotionalTones: EmotionalTone[] = ["neutral", "positive", "negative", "professional", "casual"];

export default function Home() {
  const [text, setText] = useState("");
  const [options, setOptions] = useState<TransformationOptions>({
    formality: "formal",
    creativity: 0.7,
    preserveIntent: true,
    emotionalTone: "neutral",
    varietyLevel: 0.5,
    contextPreservation: 0.8,
  });
  const [result, setResult] = useState<TransformationResponse | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleTransform = () => {
    startTransition(async () => {
      try {
        const response = await fetch("/api/transform", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, options }),
        });
        const data = await response.json();
        setResult(data);
      } catch {
        setResult({
          success: false,
          error: "Failed to transform text",
        });
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-4xl p-6">
        <h1 className="mb-2 bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-4xl font-bold text-transparent">
          AI Text Humanizer
        </h1>
        <p className="mb-8 text-gray-600">Transform AI-generated text into natural, human-like content</p>

        <div className="space-y-6">
          <div className="space-y-2">
            <Textarea
              placeholder="Enter AI-generated text to humanize..."
              className="min-h-[200px] text-base"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Emotional Tone</label>
              <Select
                value={options.emotionalTone}
                onValueChange={(value: EmotionalTone) => setOptions({ ...options, emotionalTone: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {emotionalTones.map((tone) => (
                    <SelectItem key={tone} value={tone}>
                      {tone.charAt(0).toUpperCase() + tone.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Formality</label>
              <Select
                value={options.formality}
                onValueChange={(value: "formal" | "informal") => setOptions({ ...options, formality: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="informal">Informal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleTransform} disabled={isPending || !text} className="w-full">
            {isPending ? "Transforming..." : "Humanize Text"}
          </Button>

          {result && (
            <div className="rounded-lg border bg-card p-6">
              <h2 className="mb-4 text-xl font-semibold">Result</h2>
              {result.success && result.data ? (
                <>
                  <div className="prose max-w-none">
                    <p>{result.data.transformedText}</p>
                  </div>
                  {result.data.transformations.length > 0 && (
                    <div className="mt-4">
                      <h3 className="mb-2 font-medium">Transformations Applied:</h3>
                      <ul className="space-y-1 text-sm text-gray-600">
                        {result.data.transformations.map((t, i) => (
                          <li key={i}>
                            <span className="font-mono">{t.original}</span> →{" "}
                            <span className="font-mono">{t.replacement}</span>{" "}
                            <span className="text-gray-500">
                              ({t.type}, {(t.confidence * 100).toFixed(0)}%)
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-red-500">{result.error}</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
