"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Cookies from "js-cookie";
import toast, { Toaster } from "react-hot-toast";
import { Mail, Lock } from "lucide-react";
import Link from "next/link";

/**
 * LoginPage – talks to Express /login endpoint, stores JWT in a cookie and
 * routes the user to the proper dashboard based on their role.
 *
 * Expected Express response (see server code):
 * {
 *   token: "<jwt>",
 *   user: { id, username, role }
 * }
 */
export default function LoginPage() {
    const router = useRouter();
    // ── include `remember` in initial state
    const [form, setForm] = useState({ username: "", password: "", remember: false });
    const [loading, setLoading] = useState(false);
  
    const handleChange = (e) => {
      const { name, value, type, checked } = e.target;
      setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000"}/login`,
          {
            username: form.username,
            password: form.password,
          }
        );
  
        // ── Persist cookies. If "Remember Me" checked: set long‑lived expiry (365 hari ≈ "selamanya")
        const cookieOptions = (perm) => ({
          expires: perm ? 365 : undefined, // 1 tahun; bisa diperbesar (3650) jika ingin 10 tahun
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          path: "/",
        });
  
        Cookies.set("token", data.token, cookieOptions(form.remember));
        Cookies.set("user", JSON.stringify(data.user), cookieOptions(form.remember));
  
        toast.success("Logged in successfully!");
  
        if (data.user.role === "admin") {
          router.replace("/admin/dashboard");
        }
        else if (data.user.role === "mitra") {
          router.replace("/mitra/siswa");
        } else if (data.user.role === "siswa") {
          router.replace("/siswa/paket");
        } else if (data.user.role === "tentor") {
          router.replace("/tentor/presensi");
        }
      } catch (err) {
        const message = err.response?.data?.message || "Login failed. Please try again.";
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

  return (
    <div className="min-h-screen flex">
      <Toaster position="top-right" />
      {/* Left panel */}
      <div className="hidden md:flex w-1/2 relative items-center justify-center overflow-hidden">
        {/* Gradient blob background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-indigo-500 to-yellow-300" />
        <svg
          className="absolute inset-0 w-full h-full text-transparent mix-blend-overlay"
          viewBox="0 0 600 600"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g transform="translate(300,300)">
            <path
              d="M149.8 -172.5C194.9 -140.8 229.6 -97.6 240.1 -48C250.7 1.6 236.9 58.4 207.1 105.5C177.3 152.5 131.4 189.7 80.3 208.9C29.1 228 -27.1 229 -83.4 214.7C-139.6 200.4 -195.8 170.8 -223.1 124.8C-250.4 78.8 -248.9 16.3 -232.7 -38.5C-216.5 -93.3 -185.8 -140.4 -145 -170.7C-104.2 -201 -52.1 -214.6 1.1 -216.1C54.4 -217.5 108.8 -206.8 149.8 -172.5"
              fill="white"
              fillOpacity="0.25"
            />
          </g>
        </svg>

        <div className="relative z-10 px-12">
          <div className="text-white text-5xl font-extrabold leading-tight">
            Welcome
            <br />
            Back!
          </div>
        </div>
      </div>

      {/* Right panel – form */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <h2 className="text-3xl font-semibold text-gray-900">Login</h2>
          <p className="mt-2 text-sm text-gray-500">Selamat datang kembali! Silahkan masuk ke akun Anda.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {/* E‑mail */}
            <div className="relative">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                User Name
              </label>
              <Mail className="absolute left-3 top-9 h-4 w-4 text-gray-400" />
              <input
                id="username"
                name="username"
                type="text"
                placeholder="username"
                required
                value={form.username}
                onChange={handleChange}
                className="w-full pl-10 rounded-md border border-gray-300 px-4 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <Lock className="absolute left-3 top-9 h-4 w-4 text-gray-400" />
              <input
                id="password"
                name="password"
                type="password"
                placeholder="********"
                required
                value={form.password}
                onChange={handleChange}
                className="w-full pl-10 rounded-md border border-gray-300 px-4 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Remember me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="remember"
                  checked={form.remember}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                Remember Me
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-md bg-indigo-600 py-2 font-medium text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
            >
              {loading && (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
              )}
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
          <div className="mt-6">
            <p className="text-sm text-gray-500">
              Belum punya akun?{" "}
              <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                Daftar sekarang
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
