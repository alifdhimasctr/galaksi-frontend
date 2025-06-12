import React, { useEffect, useState } from "react";
import { FaExclamationTriangle, FaTimes, FaTrash } from "react-icons/fa";
import axios from "axios";
import Cookies from "js-cookie";
import Modal from "@/app/component/modal";
import toast from "react-hot-toast";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export default function DeleteTentorModal({ open, onClose, tentorId, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [tentor, setTentor] = useState(null);
  const [msg, setMsg] = useState("");

  const handleDelete = async () => {
    setLoading(true);
    setMsg("");

    try {
      const token = Cookies.get("token");
      await axios.delete(`${API}/users/tentor/${tentorId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      onSuccess(); // Refresh the table after deletion
      toast.success("Tentor berhasil dihapus");
      setLoading(false);
      onClose(); // Close the modal after successful deletion
    } catch (err) {
      setLoading(false);
      setMsg(err?.response?.data?.message || "Gagal menghapus tentor");
      toast.error("Gagal menghapus tentor");
    }
  };

  useEffect(() => {
    
    if (!open) return;
    const fetchTentor = async () => {
      try {
        const token = Cookies.get("token");
        const { data } = await axios.get(`${API}/users/tentor/${tentorId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTentor(data);
      } catch (e) {
        toast.error(e);
      }
    };
    fetchTentor();
  }, [open, tentorId]);

  if (!open) return null;

  return (
    <Modal
          icon={<FaExclamationTriangle className="text-red-500" />}
          title="Hapus Tentor"
          onClose={onClose}
        >
          {loading ? (
            <div className="text-center py-4">Memuat data tentor...</div>
          ) : msg ? (
            <div className="text-red-600 text-center py-4">{msg}</div>
          ) : (
            <div className="flex flex-col gap-6 text-sm">
              <div className="text-center">
                <FaExclamationTriangle className="text-4xl text-red-500 mx-auto mb-3" />
                <p className="text-gray-600">
                  Apakah Anda yakin ingin menghapus tentor ini?
                </p>
              </div>
    
              {tentor && (
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <div className="text-center font-medium text-red-700">
                    {tentor.id}
                  </div>
                  <div className="text-center text-sm text-red-600 mt-1">
                    {tentor.name}
                  </div>
                </div>
              )}
    
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400 flex items-center gap-2"
                >
                  <FaTrash />
                  {loading ? "Menghapus..." : "Hapus Tentor"}
                </button>
              </div>
            </div>
          )}
        </Modal>
  );
}
