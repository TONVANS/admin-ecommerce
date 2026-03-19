// src/app/layout.tsx
import "@/css/satoshi.css";
import "@/css/style.css";
import type { PropsWithChildren } from "react";
import { GlobalProviders } from "./providers";
import { Toaster } from "sonner";

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Toaster richColors position="top-right" />
        <GlobalProviders>{children}</GlobalProviders>
      </body>
    </html>
  );
}
