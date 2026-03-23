"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";

import { Button, Card, Textarea, ThemeToggle, toast } from "@ansospace/ui";
import { SiGithub } from "@icons-pack/react-simple-icons";

import { transformText } from "@/app/actions/transform";
import { TransformationControls } from "@/components/TransformationControls";
import { TransformationLoading, TransformationPlaceholder } from "@/components/TransformationPlaceholder";
import { TransformationResultView } from "@/components/TransformationResult";
import { ValidationMessage } from "@/components/ui";
import { TransformationOptions, TransformationResult } from "@/core/entities/transformation";
import { validateTransformText } from "@/utils/validation";

export default function Home() {
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
      toast.error("Validation Error", {
        description: validation.error,
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
          toast("Low Confidence", {
            description: "Some transformations may not preserve the original meaning",
          });
        }
      } else {
        throw new Error(response.error || "Failed to transform text");
      }
    } catch (error) {
      toast.error("Transformation Error", {
        description: error instanceof Error ? error.message : "Failed to transform text",
      });
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="from-gray-5 min-h-screen bg-gradient-to-b">
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-4">
              <Image src="/humanize-ai.png" alt="Logo" width={50} height={50} />
              <span className="text-2xl font-bold">Humanize AI</span>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="https://github.com/sanjaysah101/humanize-ai" target="_blank">
              <SiGithub />
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Input Section */}
          <section className="space-y-6">
            <div className="space-y-2">
              <Card className="p-0">
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
