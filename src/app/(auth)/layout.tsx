// src/app/(auth)/layout.tsx
import type { PropsWithChildren } from "react";
import { GlobalProviders } from "../providers";

export default function AuthLayout({ children }: PropsWithChildren) {
  return (
    <GlobalProviders>
      <main className="flex min-h-screen items-center justify-center">
        {children}
      </main>
    </GlobalProviders>
  );
}
