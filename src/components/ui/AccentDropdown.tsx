"use client";

import { useEffect, useRef, useState } from "react";

import { Palette } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

const ACCENT_COLORS = {
  Default: { primary: "240 5% 26%", glow: "240 5% 34%" }, // Original gray
  Blue: { primary: "217 91% 60%", glow: "217 91% 70%" },
  Purple: { primary: "271 81% 56%", glow: "271 81% 66%" },
  Pink: { primary: "330 81% 60%", glow: "330 81% 70%" },
  Green: { primary: "142 71% 45%", glow: "142 71% 55%" },
  Orange: { primary: "25 95% 53%", glow: "25 95% 63%" },
  Red: { primary: "0 84% 60%", glow: "0 84% 70%" },
  Cyan: { primary: "189 94% 43%", glow: "189 94% 53%" },
  Teal: { primary: "173 80% 40%", glow: "173 80% 50%" },
  Indigo: { primary: "243 75% 59%", glow: "243 75% 69%" },
};

export default function AccentDropdown() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("accent-color");
      return saved && ACCENT_COLORS[saved as keyof typeof ACCENT_COLORS] ? saved : "Default";
    }
    return "Default";
  });
  const { resolvedTheme } = useTheme();

  // Add a ref for the dropdown container to detect outside clicks.
  const containerRef = useRef<HTMLDivElement | null>(null);

  const applyAccent = (color: string) => {
    const { primary, glow } = ACCENT_COLORS[color as keyof typeof ACCENT_COLORS];
    document.documentElement.style.setProperty("--accent-primary", primary);
    document.documentElement.style.setProperty("--accent-glow", glow);
    localStorage.setItem("accent-color", color);
  };

  useEffect(() => {
    applyAccent(selected);
  }, [selected]);

  // Close the dropdown when clicking outside or pressing Escape.
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (containerRef.current && target && !containerRef.current.contains(target)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <Button variant="ghost" size="icon" onClick={() => setOpen(!open)} aria-label="Accent color selector">
        <Palette className="h-5 w-5" />
      </Button>

      {open && (
        <div
          className={`absolute right-0 z-50 mt-2 w-32 rounded-md border shadow-lg backdrop-blur-sm ${
            resolvedTheme === "dark" ? "border-slate-700 bg-slate-900/90" : "border-slate-200 bg-white/90"
          }`}
        >
          {Object.keys(ACCENT_COLORS).map((color) => (
            <button
              key={color}
              onClick={() => {
                setSelected(color);
                applyAccent(color);
                setOpen(false);
              }}
              className={`w-full px-3 py-2 text-left text-sm ${
                resolvedTheme === "dark" ? "hover:bg-slate-800" : "hover:bg-slate-100"
              } ${
                selected === color
                  ? "text-[hsl(var(--accent-primary))]"
                  : resolvedTheme === "dark"
                    ? "text-slate-200"
                    : "text-slate-800"
              }`}
            >
              {color}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
