"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { FaCheckCircle, FaTimesCircle, FaSpinner } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export default function ConfirmPresensiPage() {
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Memproses konfirmasi...");
  const jadwalId = usePathname().split("/jadwal/").pop(); // Ambil jadwalId dari URL
  const router = useRouter();

  useEffect(() => {
    const confirmPresensi = async () => {
      try {
        await axios.put(`${API}/jadwal/confirm-present/${jadwalId}`);
        setStatus("success");
        setMessage("Presensi berhasil dikonfirmasi! Terima kasih.");
        
        // Redirect setelah 3 detik
        setTimeout(() => {
          router.push("/");
        }, 3000);
      } catch (error) {
        setStatus("error");
        setMessage(error.response?.data?.message || "Terjadi kesalahan saat mengkonfirmasi");
      }
    };
    
    confirmPresensi();
  }, [jadwalId]);

  // Redirect jika status success dan user klik tombol
  const handleRedirect = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg max-w-md w-full text-center">
        <div className="flex justify-center mb-5">
          {status === "success" ? (
            <FaCheckCircle className="text-green-500 text-5xl" />
          ) : status === "error" ? (
            <FaTimesCircle className="text-red-500 text-5xl" />
          ) : (
            <FaSpinner className="text-blue-500 text-5xl animate-spin" />
          )}
        </div>
        
        <h2 className="text-xl font-bold mb-3">
          {status === "success" 
            ? "Konfirmasi Berhasil!" 
            : status === "error" 
              ? "Konfirmasi Gagal" 
              : "Memproses Konfirmasi"}
        </h2>
        
        <p className="text-gray-600 mb-6">{message}</p>
        
        {status === "success" && (
          <div className="animate-pulse text-sm text-green-600">
            Anda akan diarahkan ke halaman utama...
          </div>
        )}
        
        {status !== "loading" && (
          <button
            onClick={handleRedirect}
            className="mt-4 px-5 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Ke Halaman Utama
          </button>
        )}
      </div>
    </div>
  );
}