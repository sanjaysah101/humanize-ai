"use client";

import { Copy, Share2 } from "lucide-react";

import { TransformationResult } from "@/core/entities/transformation";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { useShare } from "@/hooks/useShare";

import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

interface TransformationResultProps {
  result: TransformationResult;
}

export const TransformationResultView = ({ result }: TransformationResultProps) => {
  const { copyToClipboard, isLoading: isCopyLoading } = useCopyToClipboard();
  const { share, isLoading: isShareLoading } = useShare();
  const confidencePercentage = Math.round(result.confidence * 100);

  const handleCopy = () => {
    copyToClipboard(result.transformedText);
  };

  const handleShare = () => {
    share({
      text: result.transformedText,
      title: "Humanized AI Text",
    });
  };

  const getTypeColor = (type: "word" | "syntax" | "emotional") => {
    switch (type) {
      case "word":
        return "bg-blue-100 text-blue-800";
      case "syntax":
        return "bg-purple-100 text-purple-800";
      case "emotional":
        return "bg-rose-100 text-rose-800";
      default:
        return "bg-gray-100 text-gray-800";
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

          <p className="leading-relaxed text-gray-700">{result.transformedText}</p>

          {/* Copy and Share buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
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
                </TooltipTrigger>
                <TooltipContent side="top" className="hidden md:block">
                  <p>Copy to clipboard</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
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
                </TooltipTrigger>
                <TooltipContent side="top" className="hidden md:block">
                  <p>Share text</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {result.transformations.length > 0 && (
            <div className="mt-4">
              <h4 className="mb-2 text-sm font-medium">Transformations Applied</h4>
              <div className="flex flex-wrap gap-2">
                {result.transformations.map((t, i) => (
                  <Badge key={i} variant="secondary" className={`${getTypeColor(t.type)} text-xs`}>
                    {t.original} → {t.replacement}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
