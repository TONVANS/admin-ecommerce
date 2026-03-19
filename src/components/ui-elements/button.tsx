import { cva, VariantProps } from "class-variance-authority";
import React, { ButtonHTMLAttributes } from "react"; // ใช้ ButtonHTMLAttributes เพื่อการพิมพ์ที่แม่นยำขึ้นสำหรับปุ่ม

// 1. เพิ่ม disabled variant ใน buttonVariants เพื่อจัดการสไตล์เมื่อปุ่มถูกปิดใช้งาน
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2.5 text-center font-medium hover:bg-opacity-90 font-medium transition focus:outline-none",
  {
    variants: {
      variant: {
        primary: "bg-primary text-white",
        green: "bg-green text-white",
        dark: "bg-dark text-white dark:bg-white/10",
        outlinePrimary:
          "border border-primary hover:bg-primary hover:text-white text-primary",
        outlineGreen: "border border-green hover:bg-green/10 text-green",
        outlineDark:
          "border border-dark hover:bg-dark/10 text-dark dark:hover:bg-white/10 dark:border-white/25 dark:text-white",
      },
      shape: {
        default: "",
        rounded: "rounded-[5px]",
        full: "rounded-full",
      },
      size: {
        default: "py-3.5 px-10 py-3.5 lg:px-8 xl:px-10",
        small: "py-[11px] px-4",
      },
      // NEW: Variant สำหรับสถานะ disabled
      disabled: {
        true: "opacity-50 cursor-not-allowed pointer-events-none hover:bg-opacity-100",
      },
    },
    defaultVariants: {
      variant: "primary",
      shape: "default",
      size: "default",
    },
  },
);

// 2. ใช้ ButtonHTMLAttributes เพื่อรวมคุณสมบัติทั้งหมดของปุ่ม HTML รวมถึง disabled
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    label: string;
    icon?: React.ReactNode;
  };

export function Button({
  label,
  icon,
  variant,
  shape,
  size,
  className,
  disabled, // Destructure prop disabled ออกมา
  ...props
}: ButtonProps) {
  return (
    <button
      // 3. ส่งค่า disabled (boolean) ให้กับฟังก์ชัน buttonVariants เพื่อใช้ในการคำนวณคลาส
      className={buttonVariants({ variant, shape, size, disabled: disabled, className })}
      
      // 4. ส่งค่า disabled ให้กับ element <button> โดยตรงเพื่อปิดการทำงานตามมาตรฐาน HTML
      disabled={disabled}
      {...props}
    >
      {icon && <span>{icon}</span>}
      {label}
    </button>
  );
}