"use client";

import { FC } from "react";

import { useTheme } from "next-themes";

interface GithubIconProps {
  url: string;
  label?: string;
  darkSrc: string;
  lightSrc: string;
  size?: number;
}

const GithubIcon: FC<GithubIconProps> = ({ url, label = "GitHub", darkSrc, lightSrc, size = 18 }) => {
  const { theme, resolvedTheme } = useTheme();
  const currentTheme = theme === "system" ? resolvedTheme : theme;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-xl bg-transparent transition-colors duration-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
    >
      <img
        src={currentTheme === "dark" ? darkSrc : lightSrc}
        alt={label}
        width={size}
        height={size}
        className="transition-opacity duration-200"
      />
    </a>
  );
};

export default GithubIcon;
