/* ---------- DeletePaketModal ---------- */
import React, { useEffect, useState } from "react";
import { FaTimes, FaTrash, FaExclamationTriangle } from "react-icons/fa";
import axios from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import Modal from "@/app/component/modal";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export default function DeletePaketModal({ open, onClose, paketId, onSuccess }) {
  const [paket, setPaket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !paketId) return;

    const fetchPaket = async () => {
      try {
        const token = Cookies.get("token");
        const { data } = await axios.get(`${API}/paket/${paketId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPaket(data);
      } catch (err) {
        setError("Gagal memuat data paket");
      } finally {
        setLoading(false);
      }
    };

    fetchPaket();
  }, [open, paketId]);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      const token = Cookies.get("token");
      
      await axios.delete(`${API}/paket/${paketId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      onSuccess();
      toast.success("Paket berhasil dihapus");
      onClose();
    } catch (err) {
      toast.error("Gagal menghapus paket");
      setError(err?.response?.data?.message || "Gagal menghapus paket");
    } finally {
      setDeleting(false);
    }
  };

  if (!open) return null;

  return (
    <Modal
      icon={<FaExclamationTriangle className="text-red-500" />}
      title="Hapus Paket"
      onClose={onClose}
    >
      {loading ? (
        <div className="text-center py-4">Memuat data paket...</div>
      ) : error ? (
        <div className="text-red-600 text-center py-4">{error}</div>
      ) : (
        <div className="flex flex-col gap-6 text-sm">
          <div className="text-center">
            <FaExclamationTriangle className="text-4xl text-red-500 mx-auto mb-3" />
            <p className="text-gray-600">
              Apakah Anda yakin ingin menghapus paket ini?
            </p>
          </div>

          {paket && (
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <div className="text-center font-medium text-red-700">
                {paket.name}
              </div>
              <div className="text-center text-sm text-red-600 mt-1">
                {paket.category} • {paket.level}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={onClose}
              disabled={deleting}
              className="px-4 py-2 rounded-lg border bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400 flex items-center gap-2"
            >
              <FaTrash />
              {deleting ? "Menghapus..." : "Hapus Paket"}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}