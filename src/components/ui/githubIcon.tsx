"use client";

import { FC } from "react";

interface GithubIconProps {
  url: string;
  label?: string;
  darkSrc: string;
  lightSrc: string;
  size?: number;
}

const GithubIcon: FC<GithubIconProps> = ({ url, label = "GitHub", darkSrc, lightSrc, size = 18 }) => {
  return (
    <button
      aria-label={label}
      onClick={() => window.open(url, "_blank")}
      className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-transparent transition-colors duration-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
    >
      <img src={lightSrc} alt={label} width={size} height={size} className="block dark:hidden" draggable={false} />

      <img src={darkSrc} alt={label} width={size} height={size} className="hidden dark:block" draggable={false} />
    </button>
  );
};

export default GithubIcon;
