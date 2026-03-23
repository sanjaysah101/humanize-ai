"use client";

import { useCallback } from "react";

import { Button, Card, Progress, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@ansospace/ui";
import { Copy, Settings2, Share2, Sparkles, Type } from "lucide-react";

import { TransformationResult } from "@/core/entities/transformation";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { useShare } from "@/hooks/useShare";

interface TransformationResultProps {
  result: TransformationResult;
}

export const TransformationResultView = ({ result }: TransformationResultProps) => {
  const { copyToClipboard, isLoading: isCopyLoading } = useCopyToClipboard();
  const { share, isLoading: isShareLoading } = useShare();
  const confidencePercentage = Math.round(result.confidence * 100);

  const handleCopy = useCallback(() => {
    copyToClipboard(result.transformedText);
  }, [copyToClipboard, result.transformedText]);

  const handleShare = useCallback(() => {
    share({
      text: result.transformedText,
      title: "Humanized AI Text",
    });
  }, [share, result.transformedText]);

  const getTypeColor = (type: "word" | "syntax" | "emotional") => {
    switch (type) {
      case "word":
        return "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400";
      case "syntax":
        return "bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400";
      case "emotional":
        return "bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400";
      default:
        return "bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const getTypeIcon = (type: "word" | "syntax" | "emotional") => {
    switch (type) {
      case "word":
        return Type;
      case "syntax":
        return Settings2;
      case "emotional":
        return Sparkles;
      default:
        return Type;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Transformed Text</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Confidence</span>
              <Progress value={confidencePercentage} className="w-24" />
              <span className="text-sm font-medium">{confidencePercentage}%</span>
            </div>
          </div>

          <p className="leading-relaxed text-gray-700 dark:text-gray-300">{result.transformedText}</p>

          {/* Copy and Share buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopy}
                      disabled={isCopyLoading}
                      className="h-9 w-9 p-0 hover:bg-gray-50 dark:hover:bg-gray-800"
                      aria-label="Copy transformed text to clipboard"
                    >
                      <Copy className="h-4 w-4" />
                      <span className="sr-only">Copy to clipboard</span>
                    </Button>
                  }
                />
                <TooltipContent side="top" className="hidden md:block">
                  <p>Copy to clipboard</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleShare}
                      disabled={isShareLoading}
                      className="h-9 w-9 p-0 hover:bg-gray-50 dark:hover:bg-gray-800"
                      aria-label="Share transformed text"
                    >
                      <Share2 className="h-4 w-4" />
                      <span className="sr-only">Share text</span>
                    </Button>
                  }
                />
                <TooltipContent side="top" className="hidden md:block">
                  <p>Share text</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {result.transformations.length > 0 && (
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold tracking-wider text-gray-500 uppercase">Transformations Applied</h4>
                <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800" />
              </div>

              <div className="grid gap-px overflow-hidden rounded-xl border border-gray-100 bg-gray-100 text-sm dark:border-gray-800 dark:bg-gray-800">
                {result.transformations.map((t, i) => {
                  return (
                    <div
                      key={i}
                      className="group flex items-center justify-between bg-white p-3 transition-colors hover:bg-gray-50 dark:bg-gray-950 dark:hover:bg-gray-900/50"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg ${getTypeColor(t.type)} transition-transform group-hover:scale-110`}
                        >
                          {(() => {
                            const Icon = getTypeIcon(t.type);
                            return <Icon className="h-4 w-4" />;
                          })()}
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[10px] font-bold tracking-tight text-gray-400 uppercase group-hover:text-gray-500">
                            {t.type}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400 line-through decoration-rose-500/20">{t.original}</span>
                            <span className="text-gray-300">→</span>
                            <span className="font-semibold text-gray-900 dark:text-gray-100">{t.replacement}</span>
                          </div>
                        </div>
                      </div>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <div className="flex items-center gap-1.5 rounded-full border border-gray-100 bg-gray-50 px-2 py-0.5 text-[10px] font-bold text-gray-500 dark:border-gray-800 dark:bg-gray-900">
                                <div
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    t.confidence > 0.8
                                      ? "bg-green-500"
                                      : t.confidence > 0.6
                                        ? "bg-yellow-500"
                                        : "bg-rose-500"
                                  }`}
                                />
                                {Math.round(t.confidence * 100)}%
                              </div>
                            }
                          />
                          <TooltipContent>
                            <p>Confidence Level</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
