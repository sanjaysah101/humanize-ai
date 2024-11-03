import { Info } from "lucide-react";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";

interface InfoTooltipProps {
  content: string;
}

export const InfoTooltip = ({ content }: InfoTooltipProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Info className="h-4 w-4 cursor-help text-gray-400 hover:text-gray-600" />
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
