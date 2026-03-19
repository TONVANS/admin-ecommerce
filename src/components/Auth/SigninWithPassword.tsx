// src/components/Auth/SigninWithPassword.tsx
"use client";
import { useState } from "react";
import { useAuthStore } from "@/store/auth/authStore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function SigninWithPassword() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(username, password);
      toast.success("ເຂົ້າສູ່ລະບົບສຳເລັດ!");
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } catch (err) {
      toast.error("ຊື່ຜູ້ໃຊ້ ຫຼື ລະຫັດຜ່ານ ບໍ່ຖືກຕ້ອງ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-5">
      {/* Username Input */}
      <div className="space-y-2">
        <label htmlFor="username" className="block text-sm font-semibold text-gray-800 dark:text-gray-200">
          ຊື່ຜູ້ໃຊ້
        </label>
        <div className="relative group">
          <input
            id="username"
            type="text"
            placeholder="ໃສ່ຊື່ຜູ້ໃຊ້ຂອງທ່ານ"
            className="w-full px-4 py-3 text-sm bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:ring-blue-400 shadow-sm hover:border-gray-300 dark:hover:border-gray-600 pr-11"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
      </div>

      {/* Password Input */}
      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-semibold text-gray-800 dark:text-gray-200">
          ລະຫັດຜ່ານ
        </label>
        <div className="relative group">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="ໃສ່ລະຫັດຜ່ານຂອງທ່ານ"
            className="w-full px-4 py-3 text-sm bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:ring-blue-400 shadow-sm hover:border-gray-300 dark:hover:border-gray-600 pr-11"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            aria-label={showPassword ? "ເຊື່ອງລະຫັດຜ່ານ" : "ສະແດງລະຫັດຜ່ານ"}
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24">
                <path fill="currentColor" d="M4.405 12.635q-1.001 0-1.703-.705T2 10.218t.7-1.699t1.703-.692q1 0 1.703.696t.702 1.689q0 1.01-.701 1.716q-.701.707-1.702.707M3 18.23V17h18v1.23zm9.001-5.616q-1.001 0-1.703-.7q-.702-.701-.702-1.702t.701-1.703t1.702-.702t1.703.7q.702.701.702 1.702t-.701 1.703t-1.702.702m7.596 0q-1 0-1.703-.7q-.702-.701-.702-1.702q0-1.002.701-1.704q.701-.701 1.702-.701t1.703.7T22 10.21t-.7 1.703t-1.703.702"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24">
                <path fill="currentColor" d="M4.405 12.635q-1.001 0-1.703-.705T2 10.218t.7-1.699t1.703-.692q1 0 1.703.696t.702 1.689q0 1.01-.701 1.716q-.701.707-1.702.707m15.192-.02q-1 0-1.703-.7q-.702-.701-.702-1.702t.701-1.703t1.702-.702t1.703.7Q22 9.21 22 10.211q0 1-.7 1.703t-1.703.702m-5.193-2.404q0 .103-.015.206l-.033.213q-.062.236-.297.309q-.236.072-.447-.14L11.43 8.58q-.187-.186-.127-.421q.06-.236.296-.303q.09-.017.2-.033q.11-.015.2-.015q1.002 0 1.703.7q.7.702.7 1.704M3.617 18.23q-.262 0-.439-.177T3 17.616t.177-.439t.439-.177h11.969L2.446 3.862q-.14-.14-.15-.345t.15-.363t.354-.16t.354.16l17.692 17.692q.14.14.15.345q.01.203-.15.363t-.354.16t-.353-.16l-3.323-3.323z"></path>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Remember Me & Forgot Password */}
      <div className="flex items-center justify-between pt-1">
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-white border-2 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 cursor-pointer transition-all"
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors select-none">
            ຈື່ຂ້ອຍໄວ້
          </span>
        </label>
        <Link
          href="/auth/forgot-password"
          className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors hover:underline"
        >
          ລືມລະຫັດຜ່ານ?
        </Link>
      </div>

      {/* Sign In Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-5 mt-6 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold text-base rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="w-5 h-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>ກຳລັງເຂົ້າສູ່ລະບົບ...</span>
          </>
        ) : (
          <>
            <span>ເຂົ້າສູ່ລະບົບ</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </>
        )}
      </button>
    </form>
  );
}