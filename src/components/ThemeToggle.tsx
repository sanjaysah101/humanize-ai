"use client";

import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";

export const ThemeToggle = () => {
  const { theme, toggleTheme, mounted } = useTheme();

  // Avoid hydration mismatch
  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" disabled className="opacity-50">
        <Sun className="h-5 w-5" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
      {theme === "dark" ? (
        <>
          <Sun className="h-5 w-5" />
          <span className="sr-only">Switch to light mode</span>
        </>
      ) : (
        <>
          <Moon className="h-5 w-5" />
          <span className="sr-only">Switch to dark mode</span>
        </>
      )}
    </Button>
  );
};
