"use client";
import React, { useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import toast from "react-hot-toast";
import Modal from "@/app/component/modal";
import { FaExclamationTriangle, FaTrash, FaTimes } from "react-icons/fa";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export default function DeleteModal({ open, onClose, onSuccess, orderId }) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleDelete = async () => {
    try {
      setLoading(true);
      const token = Cookies.get("token");
      await axios.delete(`${API}/order/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onSuccess(); // Refresh data
      onClose();
    } catch (error) {
      toast.error("Gagal menghapus order");
      setMsg(error?.response?.data?.message || "Gagal menghapus order");
    } finally {
      setLoading(false);
    }
  };
    if (!open) return null;

  return (
    <Modal
      icon={<FaExclamationTriangle className="text-yellow-500" />}
      title="Hapus Order"
      onClose={onClose}
    >
      <div className="flex flex-col gap-4 text-sm">
        <p>Apakah Anda yakin ingin menghapus order ini? Tindakan ini tidak dapat dibatalkan.</p>
        {msg && <span className="text-red-600 text-sm">{msg}</span>}
        <div className="flex justify-end gap-2 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded border bg-gray-100 hover:bg-gray-200"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white disabled:opacity-60"
          >
            {loading ? "Menghapus..." : "Hapus"}
          </button>
        </div>
      </div>
    </Modal>
  );
}