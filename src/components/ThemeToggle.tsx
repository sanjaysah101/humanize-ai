"use client";

import { useEffect, useState } from "react";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import AccentDropdown from "@/components/ui/AccentDropdown";

export const ThemeToggle = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  // Avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="flex gap-2">
        <Button variant="ghost" size="icon" disabled className="opacity-50">
          <Sun className="h-5 w-5" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
        {resolvedTheme === "dark" ? (
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
      <AccentDropdown />
    </div>
  );
};
