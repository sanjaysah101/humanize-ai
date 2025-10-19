import { ArrowRight, Bot, Sparkles } from "lucide-react";

import { Card } from "./ui/card";

export const TransformationPlaceholder = () => {
  return (
    <Card className="text-muted-foreground flex min-h-[200px] flex-col items-center justify-center border-2 border-dashed p-8">
      <div className="mb-4 flex items-center gap-4">
        <Bot size={24} />
        <ArrowRight size={20} />
        <Sparkles size={24} />
      </div>
      <p className="text-center text-sm">
        Your transformed text will appear here.
        <br />
        Enter some text and adjust the controls to get started.
      </p>
    </Card>
  );
};

export const TransformationLoading = () => {
  return (
    <Card className="flex min-h-[200px] flex-col items-center justify-center border p-8">
      <div className="text-muted-foreground mb-3 flex items-center gap-3">
        <Sparkles className="animate-pulse" size={20} />
        <span className="text-sm">Transforming your text…</span>
      </div>
      <div className="h-1 w-56 overflow-hidden rounded bg-gray-200 dark:bg-gray-800">
        <div className="h-full w-1/3 animate-[loading_1.2s_ease_infinite] bg-[hsl(var(--accent-primary))]" />
      </div>
      {/* Tailwind keyframes via arbitrary value */}
      <style jsx>{`
        @keyframes loading {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(300%);
          }
        }
      `}</style>
    </Card>
  );
};
