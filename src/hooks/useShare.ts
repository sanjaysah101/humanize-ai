"use client";

import { useCallback, useState } from "react";

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

  // Helper function to handle clipboard fallback
  const handleClipboardFallback = useCallback(
    async (text: string, fallbackMessage: string) => {
      const copySuccess = await copyToClipboard(text, false);
      if (copySuccess) {
        toast({
          title: fallbackMessage,
          description: "Text copied to clipboard - paste it anywhere",
          variant: "default",
        });
      }
      return copySuccess;
    },
    [copyToClipboard, toast]
  );

  const share = useCallback(
    async (data: ShareData) => {
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
        return await handleClipboardFallback(data.text, "Ready to share!");
      } catch (error) {
        // Handling user cancellation (not really an error)
        if (error instanceof Error && error.name === "AbortError") {
          return false;
        }

        // Falling back to copy on any other errors (like permission denied)
        return await handleClipboardFallback(data.text, "Share unavailable");
      } finally {
        setIsLoading(false);
      }
    },
    [toast, handleClipboardFallback]
  );

  return { share, isLoading };
};
