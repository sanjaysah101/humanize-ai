"use client";

import { useCallback, useState } from "react";

import { toast } from "@ansospace/ui";

export const useCopyToClipboard = () => {
  const [isLoading, setIsLoading] = useState(false);

  const copyToClipboard = useCallback(async (text: string, showToast: boolean = true) => {
    if (!text) {
      if (showToast) {
        toast.error("Nothing to copy", {
          description: "No text available to copy",
        });
      }
      return false;
    }

    setIsLoading(true);

    try {
      // Trying modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers or non-secure(http) contexts , rarely used
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "absolute";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        const successful = document.execCommand("copy");
        document.body.removeChild(textArea);

        if (!successful) {
          throw new Error("Copy command failed");
        }
      }

      if (showToast) {
        toast("Copied!", {
          description: "Text copied to clipboard",
        });
      }

      return true;
    } catch {
      if (showToast) {
        toast.error("Copy failed", {
          description: "Unable to copy text to clipboard",
        });
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { copyToClipboard, isLoading };
};
