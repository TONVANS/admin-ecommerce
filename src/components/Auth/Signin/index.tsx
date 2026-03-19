// src/components/Auth/Signin/index.tsx
"use client";
import Link from "next/link";
import SigninWithPassword from "../SigninWithPassword";

export default function Signin() {
  return (
    <div className="w-full">
      {/* {<GoogleSigninButton text="Sign in" />} */}

      {/* <div className="my-6 flex items-center gap-4">
        <span className="block flex-1 h-px bg-gradient-to-r from-gray-300 via-gray-300 to-transparent dark:from-gray-700 dark:via-gray-700 dark:to-transparent"></span>
        <div className="px-3 text-center text-sm font-medium text-gray-600 dark:text-gray-400">
          Or continue with email
        </div>
        <span className="block flex-1 h-px bg-gradient-to-l from-gray-300 via-gray-300 to-transparent dark:from-gray-700 dark:via-gray-700 dark:to-transparent"></span>
      </div> */}

      <div>
        <SigninWithPassword />
      </div>
    </div>
  );
}