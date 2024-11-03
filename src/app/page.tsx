"use client";

import { useState } from "react";

import { transformText } from "@/app/actions/transform";
import { TransformationResultView } from "@/components/TransformationResult";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { TransformationOptions, TransformationResult } from "@/core/entities/transformation";
import { toast } from "@/hooks/use-toast";

const emotionalTones = ["neutral", "positive", "negative", "professional", "casual"] as const;

export default function Home() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TransformationResult | null>(null);
  const [options, setOptions] = useState<TransformationOptions>({
    formality: "informal",
    emotionalTone: "neutral",
    creativity: 0.5,
    preserveIntent: true,
    varietyLevel: 0.5,
    contextPreservation: 0.8,
  });

  const handleTransform = async () => {
    if (!text.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text to transform",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await transformText(text, options);
      if (response.success && response.data) {
        setResult(response.data);
        toast({
          title: "Success",
          description: "Text transformed successfully",
        });
      } else {
        throw new Error(response.error || "Failed to transform text");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to transform text",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container max-w-4xl space-y-8 py-10">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">AI Text Humanizer</h1>
        <p className="text-gray-600">Transform AI-generated text into natural, human-like content</p>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          <Textarea
            placeholder="Enter AI-generated text to humanize..."
            className="min-h-[200px] text-base"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Emotional Tone</label>
              <Select
                value={options.emotionalTone}
                onValueChange={(value: (typeof emotionalTones)[number]) =>
                  setOptions({ ...options, emotionalTone: value })
                }
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

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Creativity Level</label>
              <Slider
                value={[options.creativity]}
                onValueChange={([value]) => setOptions({ ...options, creativity: value })}
                max={1}
                step={0.1}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Context Preservation</label>
              <Slider
                value={[options.contextPreservation]}
                onValueChange={([value]) => setOptions({ ...options, contextPreservation: value })}
                max={1}
                step={0.1}
              />
            </div>
          </div>

          <Button className="w-full" size="lg" onClick={handleTransform} disabled={loading || !text.trim()}>
            {loading ? "Transforming..." : "Transform Text"}
          </Button>
        </div>
      </Card>

      {result && <TransformationResultView result={result} />}
    </main>
  );
}
