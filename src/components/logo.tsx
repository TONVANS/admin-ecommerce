import { dark_logo, main_logo } from "@/assets/logos";
import Image from "next/image";
import { ReactNode } from "react";

interface LogoProps {
  brandName?: string;
  showBrand?: boolean;
  variant?: "horizontal" | "icon-only";
}

export function Logo({
  brandName = "NextAdmin",
  showBrand = true,
  variant = "horizontal"
}: LogoProps) {
  return (
    <div className="flex items-center gap-3">
      {/* Logo Icon */}
      <div className="relative h-8 w-8 flex-shrink-0">
        <Image
          src={main_logo}
          fill
          className="dark:hidden"
          alt={brandName}
          role="presentation"
          quality={100}
        />

        <Image
          src={dark_logo}
          fill
          className="hidden dark:block"
          alt={brandName}
          role="presentation"
          quality={100}
        />
      </div>

      {/* Brand Name */}
      {showBrand && variant === "horizontal" && (
        <div className="flex flex-col">
          <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-xl font-bold tracking-tight text-transparent dark:from-blue-400 dark:to-blue-300">
            {brandName}
          </span>
          <span className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
            Admin Ecommerce System
          </span>
        </div>
      )}
    </div>
  );
}