"use client";

import type { ReactNode } from "react";

import { ThemeProvider as NextThemesProvider, Toaster } from "@ansospace/ui";

export function RootProviders({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      enableColorScheme
    >
      {children}
      <Toaster richColors />
    </NextThemesProvider>
  );
}
