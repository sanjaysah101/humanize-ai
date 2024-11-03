"use client";

import { useState } from "react";

import { transformText } from "@/app/actions/transform";
import { TransformationControls } from "@/components/TransformationControls";
import { TransformationPlaceholder } from "@/components/TransformationPlaceholder";
import { TransformationResultView } from "@/components/TransformationResult";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { TransformationOptions, TransformationResult } from "@/core/entities/transformation";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const { toast } = useToast();
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
        if (response.data.confidence < 0.5) {
          toast({
            title: "Low Confidence",
            description: "The transformation may not maintain the original meaning well",
            variant: "default",
          });
        }
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <main className="container mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-8 text-center text-4xl font-bold tracking-tight">AI Text Humanizer</h1>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Input Section */}
          <section className="space-y-6">
            <Card className="overflow-hidden border-2">
              <Textarea
                placeholder="Enter text to transform..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[200px] resize-none border-0 p-4 focus:ring-0"
                disabled={loading}
              />
            </Card>

            <TransformationControls options={options} onChange={setOptions} disabled={loading} />

            <Button className="w-full" size="lg" onClick={handleTransform} disabled={loading || !text.trim()}>
              {loading ? "Transforming..." : "Transform Text"}
            </Button>
          </section>

          {/* Output Section */}
          <section className="space-y-6">
            {result ? <TransformationResultView result={result} /> : <TransformationPlaceholder />}
          </section>
        </div>
      </main>
    </div>
  );
}
