"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import Modal from "@/app/component/modal";
import { FaTimesCircle, FaExclamationTriangle } from "react-icons/fa";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export default function RejectTentorModal({ open, onClose, onSuccess, jadwalId }) {
  const [tentors, setTentors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");


  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
  
    
    try {
      setLoading(true);
      const token = Cookies.get("token");
  
        await axios.put(`${API}/jadwal/reschedule/tentor/reject/${jadwalId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        setLoading(false);
        toast.success("Pengajual Berhasil Ditolak");
        onSuccess(); // Refresh or reload table
        onClose(); // Close modal after success
    } catch (err) {
      setLoading(false);
    const errorMessage = err.response?.data?.message || "Gagal Memperbarui Jadwal";
    toast.error(errorMessage);
      // Jika error respons adalah error normal API yang diharapkan
    }
  };
  
  

  if (!open) return null;

  return (
    <Modal
      icon={<FaExclamationTriangle className="text-red-500" />}
      title="Tolak Pengajuan"
      onClose={onClose}
    >
      <div className="flex flex-col gap-4 text-sm">
        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <div className="text-center font-medium text-red-700">
            Jadwal ID: {jadwalId}
          </div>
          <p className="text-center text-sm text-red-600 mt-1">
            Anda akan menolak pengajuan tentor untuk jadwal ini
          </p>
        </div>

        <div className="text-center py-4">
          <FaTimesCircle className="text-3xl text-red-500 mx-auto mb-3" />
          <p className="text-gray-600">
            Apakah Anda yakin ingin menolak pengajuan ini?
          </p>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700
              hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2.5 rounded-lg bg-red-600 text-white 
              hover:bg-red-700 disabled:bg-red-400 transition-colors
              flex items-center gap-2"
          >
            <FaTimesCircle />
            {loading ? "Memproses..." : "Tolak Pengajuan"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
