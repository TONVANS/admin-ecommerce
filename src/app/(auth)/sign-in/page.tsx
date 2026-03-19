// src/app/(auth)/sign-in/page.tsx
import Signin from "@/components/Auth/Signin";
import { Logo } from "@/components/logo";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function SignIn() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-6xl">
        <div className="rounded-2xl bg-white shadow-2xl dark:bg-gray-900 overflow-hidden">
          <div className="flex flex-col lg:flex-row items-stretch min-h-[600px]">
            
            {/* Left Side - Sign In Form */}
            <div className="w-full lg:w-1/2 p-6 sm:p-8 md:p-10 lg:p-12 flex flex-col justify-center">
              
              {/* Logo */}
              <Link href="/" className="inline-flex items-center gap-2 mb-6 md:mb-8 hover:opacity-80 transition-opacity">
                <Logo brandName="ລະບົບຮ້ານຄ້າຊາວໜຸ່ມ" showBrand={true} />
              </Link>

              {/* Header */}
              <div className="mb-6 md:mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  ເຂົ້າສູ່ລະບົບ
                </h1>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                  ກະລຸນາເຂົ້າສູ່ລະບົບເພື່ອດຳເນີນການຕໍ່
                </p>
              </div>

              {/* Sign In Form */}
              <Signin />

            </div>

            {/* Right Side - Welcome Section (Hidden on Mobile) */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 dark:from-blue-900 dark:via-blue-800 dark:to-blue-950 p-10 xl:p-12 relative overflow-hidden">
              
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 animate-pulse"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 animate-pulse" style={{ animationDelay: "2s" }}></div>
              <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-blue-200 rounded-full mix-blend-multiply filter blur-2xl opacity-15 dark:opacity-5 animate-pulse" style={{ animationDelay: "1s" }}></div>

              <div className="relative z-10 flex flex-col justify-between w-full">

                {/* Content */}
                <div className="flex flex-col justify-center flex-1">
                  <div className="max-w-md">
                    <p className="text-blue-100 dark:text-blue-200 text-xs font-semibold mb-3 uppercase tracking-widest">
                      ຍິນດີຕ້ອນຮັບ
                    </p>
                    <h2 className="text-3xl xl:text-4xl font-bold text-white mb-6 leading-tight">
                      ລະບົບຄຸ້ມຄອງ<br />ຮ້ານຄ້າຊາວໜຸ່ມ
                    </h2>
                    <p className="text-blue-50 dark:text-blue-100 text-base xl:text-lg mb-8 leading-relaxed">
                      ເຂົ້າສູ່ລະບົບເພື່ອຈັດການສິນຄ້າ, ອະນຸມັດຮ້ານຄ້າ ແລະ ເບິ່ງລາຍງານ
                    </p>

                    {/* Features List */}
                    <ul className="space-y-3.5">
                      <li className="flex items-center gap-3 text-white">
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="font-medium text-base">ຈັດການຂໍ້ມູນພື້ນຖານ</span>
                      </li>
                      <li className="flex items-center gap-3 text-white">
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="font-medium text-base">ເບິ່ງສະຖິຕິຂໍ້ມູນ</span>
                      </li>
                      <li className="flex items-center gap-3 text-white">
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="font-medium text-base">ລາຍງານຍອດຂາຍ</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Bottom Accent */}
                <div className="pt-8 border-t border-white/20">
                  <p className="text-blue-50 dark:text-blue-100 text-sm">
                    © 2024 Your Brand. ຜ່ານການກວດສອບຄວາມປອດໄພ
                  </p>
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* Footer Text */}
        {/* <div className="text-center mt-6 text-gray-600 dark:text-gray-400 text-sm">
          <p>
            ມີບັນຫາໃນການເຂົ້າສູ່ລະບົບ?{" "}
            <Link href="/auth/forgot-password" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold transition-colors hover:underline">
              ຣີເຊັດລະຫັດຜ່ານ
            </Link>
          </p>
        </div> */}
      </div>
    </div>
  );
}