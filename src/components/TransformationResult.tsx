import { TransformationResult } from "@/core/entities/transformation";

import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";

interface TransformationResultProps {
  result: TransformationResult;
}

export const TransformationResultView = ({ result }: TransformationResultProps) => {
  const confidencePercentage = Math.round(result.confidence * 100);

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
