"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class" // Cái này cực quan trọng để nó nhận diện class .dark trong CSS của ông
      defaultTheme="system"
      enableSystem
    >
      {children}
    </NextThemesProvider>
  );
}
