"use client";

import { useEffect, useState } from "react";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import AccentDropdown from "@/components/ui/AccentDropdown";
import { Button } from "@/components/ui/button";

export const ThemeToggle = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a placeholder or null to avoid hydration errors
    return (
      <div className="flex gap-2">
        <Button variant="ghost" size="icon" disabled className="h-9 w-9" />
        <AccentDropdown />
      </div>
    );
  }

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

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
