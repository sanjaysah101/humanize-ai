"use client";

import Image from "next/image";
import Link from "next/link";

type LogoProps = {
  src?: string;
  alt?: string;
  size?: string;
  rounded?: boolean;
  className?: string;
};

export function Logo({
  src = "/logo1.png",
  alt = "Humanize AI",
  size = "h-10 w-10",
  rounded = false,
  className,
}: LogoProps) {
  const match = size.match(/h-(\d+).*w-(\d+)/);
  const height = match ? parseInt(match[1]) * 4 : 40; // Tailwind scale: h-10 ≈ 40px
  const width = match ? parseInt(match[2]) * 4 : 40;

  return (
    <Link href="/" className={`inline-flex items-center ${className ?? ""}`} aria-label={alt}>
      <span
        className={`${size} inline-flex items-center justify-center p-0.5 ring-1 ring-gray-200 transition-all duration-200 ease-out hover:scale-105 hover:shadow-lg hover:ring-2 hover:ring-indigo-400/25 dark:ring-gray-700 ${
          rounded ? "rounded-full" : ""
        }`}
      >
        <Image src={src} alt={alt} width={width} height={height} className="h-full w-full object-contain" priority />
      </span>
    </Link>
  );
}

export default Logo;
