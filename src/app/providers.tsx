"use client";

import { SidebarProvider } from "@/components/Layouts/sidebar/sidebar-context";
import { ThemeProvider } from "next-themes";

export function GlobalProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="light" attribute="class">
      {children}
    </ThemeProvider>
  );
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="light" attribute="class">
      <SidebarProvider>{children}</SidebarProvider>
    </ThemeProvider>
  );
}
