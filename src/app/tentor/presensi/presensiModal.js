"use client";
import React, { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import Modal from "@/app/component/modal";
import { FaCheckCircle, FaCopy, FaWhatsapp } from "react-icons/fa";
import { FiCopy, FiSend } from "react-icons/fi";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export default function PresentModal({ open, onClose, jadwalId, refreshData }) {
  const [loading, setLoading] = useState(false);
  const [confirmationLink, setConfirmationLink] = useState("");
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [siswaData, setSiswaData] = useState(null);

  const handlePresent = async () => {
    try {
      setLoading(true);
      const token = Cookies.get("token");
      const response = await axios.put(
        `${API}/jadwal/request-present/${jadwalId}`,
        null,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      // Dapatkan data siswa dari response
      if (response.data && response.data.siswa) {
        setSiswaData(response.data.siswa);
      }
      
      // Generate confirmation link
      const link = `${window.location.origin}/siswa/jadwal/${jadwalId}`;
      setConfirmationLink(link);
      setRequestSuccess(true);
      
      toast.success("Permintaan presensi dikirim! Berikan link ini ke siswa");
      console.log(response.data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Terjadi kesalahan";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(confirmationLink);
    toast.success("Link disalin ke clipboard!");
  };

  const sendWhatsApp = () => {
    if (!siswaData || !siswaData.noHp) {
      toast.error("Nomor WhatsApp siswa tidak tersedia");
      return;
    }

    let phone = siswaData.noHp;
    if (phone.startsWith("0")) {
      phone = "62" + phone.slice(1);
    }
    
    const message = `Halo, saya Tentor Anda. Silakan konfirmasi kehadiran Anda melalui link berikut: ${confirmationLink}`;
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const resetModal = () => {
    setConfirmationLink("");
    setRequestSuccess(false);
    setSiswaData(null);
  };

  if (!open) return null;

  return (
    <Modal
      icon={<FaCheckCircle className="text-yellow-500" />}
      title={requestSuccess ? "Link Konfirmasi Siswa" : "Ajukan Presensi"}
      onClose={() => {
        resetModal();
        onClose();
      }}
      width={requestSuccess ? "lg" : "md"}
    >
      {requestSuccess ? (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Berikan link berikut kepada siswa untuk mengkonfirmasi kehadiran:
          </p>
          
          <div className="flex items-center border rounded-lg overflow-hidden bg-gray-50">
            <input
              type="text"
              value={confirmationLink}
              readOnly
              className="flex-1 px-3 py-2 bg-transparent text-sm truncate"
            />
            <button
              onClick={copyToClipboard}
              className="p-2 hover:bg-gray-200 transition-colors"
              title="Salin link"
            >
              <FiCopy className="text-gray-600" />
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={sendWhatsApp}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
              disabled={!siswaData?.noHp}
            >
              <FaWhatsapp size={18} />
              Kirim via WhatsApp
              {!siswaData?.noHp && (
                <span className="text-xs text-yellow-200">(Nomor tidak tersedia)</span>
              )}
            </button>
            
            <button
              onClick={() => {
                resetModal();
                refreshData();
                onClose();
              }}
              className="px-4 py-2 rounded border bg-gray-100 hover:bg-gray-200"
            >
              Tutup
            </button>
          </div>
          
          <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <h3 className="font-medium text-blue-800 mb-1">Petunjuk untuk Tentor:</h3>
            <ul className="text-sm text-blue-700 list-disc pl-5 space-y-1">
              <li>Berikan link ini kepada siswa setelah sesi berakhir</li>
              <li>Siswa harus mengklik link untuk mengkonfirmasi kehadiran</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p>Ajukan presensi untuk sesi ini? Siswa akan diminta mengkonfirmasi kehadiran.</p>
          
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => {
                resetModal();
                onClose();
              }}
              className="px-4 py-2 rounded border bg-gray-100 hover:bg-gray-200"
            >
              Batal
            </button>
            <button
              onClick={handlePresent}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded bg-yellow-500 hover:bg-yellow-600 text-white disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="animate-spin">↻</span> Mengirim...
                </>
              ) : (
                <>
                  <FiSend /> Ajukan Presensi
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}