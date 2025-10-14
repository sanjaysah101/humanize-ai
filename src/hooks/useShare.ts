"use client";

import { useState } from "react";

import { useToast } from "@/hooks/use-toast";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

interface ShareData {
  text: string;
  title?: string;
  url?: string;
}

type MaybeWebShareNavigator = Navigator & {
  share?: (data: ShareData) => Promise<void>;
  canShare?: (data: ShareData) => boolean;
};

export const useShare = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { copyToClipboard } = useCopyToClipboard();

  const share = async (data: ShareData) => {
    if (!data.text) {
      toast({
        title: "Nothing to share",
        description: "No text available to share",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);

    try {
      // Checking if Web Share API is available (mostly mobile browsers)
      if (typeof navigator !== "undefined") {
        const nav = navigator as MaybeWebShareNavigator;
        if (typeof nav.share === "function") {
          const shareData: ShareData = {
            text: data.text,
            title: data.title || "Humanized AI Text",
            ...(data.url && { url: data.url }),
          };

          const canShareOk = typeof nav.canShare === "function" ? nav.canShare(shareData) : true;
          if (canShareOk) {
            await nav.share(shareData);
            return true;
          }
        }
      }
      // Falling back to copy to clipboard
      const copySuccess = await copyToClipboard(data.text, false);
      if (copySuccess) {
        toast({
          title: "Ready to share!",
          description: "Text copied to clipboard - paste it anywhere",
          variant: "default",
        });
      }
      return copySuccess;
    } catch (error) {
      // Handling user cancellation (not really an error)
      if (error instanceof Error && error.name === "AbortError") {
        // Not showing error as user cancelled the share dialog
        return false;
      }

      // Falling back to copy on any other errors (like permission denied)
      const copySuccess = await copyToClipboard(data.text, false);
      if (copySuccess) {
        toast({
          title: "Share unavailable",
          description: "Text copied to clipboard instead",
          variant: "default",
        });
      }
      return copySuccess;
    } finally {
      setIsLoading(false);
    }
  };

  return { share, isLoading };
};
