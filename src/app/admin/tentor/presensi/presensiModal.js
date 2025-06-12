"use client";
import React, { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import Modal from "@/app/component/modal";
import { FaCheckCircle } from "react-icons/fa";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export default function PresentModal({ open, onClose, jadwalId, refreshData }) {
  const [loading, setLoading] = useState(false);

  const handlePresent = async () => {
    try {
      setLoading(true);
      const token = Cookies.get("token");
      await axios.put(`${API}/jadwal/present/${jadwalId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Presensi berhasil dicatat");
      refreshData();
      onClose();
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || "Terjadi kesalahan";
        toast.error(errorMessage);
      
    } finally {
      setLoading(false);
    }
  };

    if (!open) return null;

  return (
    <Modal
      icon={<FaCheckCircle className="text-green-500" />}
      title="Konfirmasi Presensi"
      onClose={onClose}
    >
      <div className="space-y-4">
        <p>Apakah Anda yakin ingin mencatat presensi untuk sesi ini?</p>
        
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border bg-gray-100 hover:bg-gray-200"
          >
            Batal
          </button>
          <button
            onClick={handlePresent}
            disabled={loading}
            className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white disabled:opacity-60"
          >
            {loading ? "Memproses..." : "Konfirmasi Hadir"}
          </button>
        </div>
      </div>
    </Modal>
  );
}