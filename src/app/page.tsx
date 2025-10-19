"use client";

import React, { useState } from "react";

import { transformText } from "@/app/actions/transform";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TransformationControls } from "@/components/TransformationControls";
import { TransformationLoading, TransformationPlaceholder } from "@/components/TransformationPlaceholder";
import { TransformationResultView } from "@/components/TransformationResult";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ValidationMessage } from "@/components/ui/validation-message";
import { TransformationOptions, TransformationResult } from "@/core/entities/transformation";
import { useToast } from "@/hooks/use-toast";
import { validateTransformText } from "@/utils/validation";

export default function Home() {
  const { toast } = useToast();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TransformationResult | null>(null);
  const [options, setOptions] = useState<TransformationOptions>({
    formality: "formal",
    emotionalTone: "neutral",
    creativity: 0.5,
    preserveIntent: true,
    varietyLevel: 0.5,
    contextPreservation: 0.8,
  });
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);

    if (newText.trim()) {
      const validation = validateTransformText(newText);
      if (!validation.isValid) {
        setValidationError(validation.error || "");
      } else {
        setValidationError(null);
      }
    } else {
      setValidationError(null);
    }
  };

  const handleTransform = async () => {
    const validation = validateTransformText(text);

    if (!validation.isValid) {
      setValidationError(validation.error || "");
      toast({
        title: "Validation Error",
        description: validation.error,
        variant: "destructive",
      });
      return;
    }

    setValidationError(null);
    setLoading(true);
    try {
      const response = await transformText(text, options);
      if (response.success && response.data) {
        // Accept result even if there are zero recorded transformations
        setResult(response.data);
        if (response.data.confidence < 0.5) {
          toast({
            title: "Low Confidence",
            description: "Some transformations may not preserve the original meaning",
            variant: "default",
          });
        }
      } else {
        throw new Error(response.error || "Failed to transform text");
      }
    } catch (error) {
      toast({
        title: "Transformation Error",
        description: error instanceof Error ? error.message : "Failed to transform text",
        variant: "destructive",
      });
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold">AI Text Humanizer</span>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-8 text-center text-4xl font-bold tracking-tight">AI Text Humanizer</h1>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Input Section */}
          <section className="space-y-6">
            <div className="space-y-2">
              <Card className="overflow-hidden border-2 transition-colors focus-within:border-[hsl(var(--accent-primary))]">
                <Textarea
                  placeholder="Enter text to transform..."
                  value={text}
                  onChange={handleTextChange}
                  className="min-h-[200px] resize-none border-0 p-4 focus:ring-0"
                  disabled={loading}
                />
              </Card>
              {validationError && <ValidationMessage title="Input Validation" message={validationError} type="error" />}
            </div>

            <TransformationControls options={options} onChange={setOptions} disabled={loading} />

            <Button
              className="w-full"
              variant={"default"}
              size="lg"
              onClick={handleTransform}
              disabled={loading || !text.trim() || !!validationError}
            >
              {loading ? "Transforming..." : "Transform Text"}
            </Button>
          </section>

          {/* Output Section */}
          <section className="space-y-6">
            {loading ? (
              <TransformationLoading />
            ) : result ? (
              <TransformationResultView result={result} />
            ) : (
              <TransformationPlaceholder />
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
