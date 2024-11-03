import { AlertCircle, Info } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ValidationMessageProps {
  title: string;
  message: string;
  type: "error" | "warning" | "info";
}

export const ValidationMessage = ({ title, message, type }: ValidationMessageProps) => {
  const icons = {
    error: <AlertCircle className="h-4 w-4 text-destructive" />,
    warning: <AlertCircle className="h-4 w-4 text-yellow-500" />,
    info: <Info className="h-4 w-4 text-blue-500" />,
  };

  return (
    <Alert variant={type === "error" ? "destructive" : "default"} className="mt-2">
      <div className="flex gap-2">
        {icons[type]}
        <div>
          <AlertTitle>{title}</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </div>
      </div>
    </Alert>
  );
};
