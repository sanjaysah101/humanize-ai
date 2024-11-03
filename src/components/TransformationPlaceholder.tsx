import { ArrowRight, Bot, Sparkles } from "lucide-react";

import { Card } from "./ui/card";

export const TransformationPlaceholder = () => {
  return (
    <Card className="flex min-h-[200px] flex-col items-center justify-center border-2 border-dashed p-8 text-muted-foreground">
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
