"use client";
import React, { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import Modal from "@/app/component/modal";
import { FaUserEdit } from "react-icons/fa";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export default function RescheduleModal({ open, onClose, jadwalId, refreshData }) {
  const [loading, setLoading] = useState(false);

  const handleRescheduleTentor = async () => {
    try {
      setLoading(true);
      const token = Cookies.get("token");
      await axios.put(`${API}/jadwal/reschedule/tentor/${jadwalId}`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Permintaan ganti tentor berhasil diajukan");
      refreshData();
      onClose();
    } catch (error) {
      toast.error("Gagal mengajukan permintaan ganti tentor");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <Modal
      icon={<FaUserEdit className="text-orange-500" />}
      title="Ajukan Ganti Tentor"
      onClose={onClose}
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Permintaan ganti tentor akan diteruskan ke admin.
        </p>
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border bg-gray-100 hover:bg-gray-200"
          >
            Batal
          </button>
          <button
            onClick={handleRescheduleTentor}
            disabled={loading}
            className="px-4 py-2 rounded bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-60"
          >
            {loading ? "Mengajukan..." : "Ajukan Ganti Tentor"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
