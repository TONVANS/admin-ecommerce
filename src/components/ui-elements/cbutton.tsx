import React from 'react';

// ----------------------------------------------------------------------
// 1. Reusable CustomButton Component (คอมโพเนนต์ปุ่มที่นำกลับมาใช้ใหม่ได้)
// ----------------------------------------------------------------------

/**
 * คอมโพเนนต์ปุ่มที่กำหนดเอง (CustomButton)
 * รับ props:
 * - onClick: ฟังก์ชันที่จะทำงานเมื่อคลิก
 * - children: เนื้อหาภายในปุ่ม (ข้อความ)
 * - colorClass: คลาส Tailwind สำหรับสีพื้นหลังและสีเมื่อถูกโฮเวอร์
 */
interface CustomButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  colorClass: string;
  disabled?: boolean;
}

const CustomButton = ({ onClick, children, colorClass, disabled }: CustomButtonProps) => (
  <button
    onClick={onClick}
    disabled={disabled}
   className={`
      font-semibold 
      py-3 
      px-6 
      rounded-xl 
      shadow-md 
      transition 
      duration-300 
      ease-in-out 
      transform hover:scale-[1.02]
      w-full
      disabled:opacity-50 
      disabled:cursor-not-allowed 
      
      ${colorClass}
    `}
  >
    {children}
  </button>
);
export default CustomButton;