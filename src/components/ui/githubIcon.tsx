"use client";

import Image from "next/image";
import { FC, useEffect, useState } from "react";

import { useTheme } from "next-themes";

interface GithubIconProps {
  url: string;
  label?: string;
  darkSrc: string;
  lightSrc: string;
  size?: number;
}

const GithubIcon: FC<GithubIconProps> = ({ url, label = "GitHub", darkSrc, lightSrc, size = 18 }) => {
  const [mounted, setMounted] = useState(false);
  const { theme, resolvedTheme } = useTheme();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-transparent" />;
  }

  const currentTheme = theme === "system" ? resolvedTheme : theme;

  return (
    <button
      aria-label={label}
      onClick={() => window.open(url, "_blank")}
      className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-transparent transition-colors duration-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
    >
      <Image
        src={currentTheme === "dark" ? darkSrc : lightSrc}
        alt={label}
        width={size}
        height={size}
        className="transition-opacity duration-200"
      />
    </button>
  );
};

export default GithubIcon;
