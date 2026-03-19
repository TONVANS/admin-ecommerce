
import type { PropsWithChildren } from "react";
import { AppProviders } from "../providers";
import { Sidebar } from "@/components/Layouts/sidebar";
import { Header } from "@/components/Layouts/header";
import NextTopLoader from "nextjs-toploader";

export default function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <AppProviders>
      <NextTopLoader color="#5750F1" showSpinner={false} />
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="w-full bg-gray-2 dark:bg-[#020d1a]">
          <Header />
          <main className="mx-auto w-full max-w-screen-2xl p-4 md:p-6 2xl:p-10">
            {children}
          </main>
        </div>
      </div>
    </AppProviders>
  );
}
