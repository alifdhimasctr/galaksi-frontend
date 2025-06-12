/* ---------- DetailPaketModal ---------- */
import React, { useEffect, useState } from "react";
import {
  FaTimes, FaTag, FaFileAlt, FaList, FaGraduationCap, 
  FaClock, FaMoneyBillWave, FaCheckCircle
} from "react-icons/fa";
import axios from "axios";
import Cookies from "js-cookie";
import Modal from "@/app/component/modal";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export default function DetailPaketModal({ open, onClose, paketId }) {
  const [loading, setLoading] = useState(true);
  const [paket, setPaket] = useState(null);
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
        setError("Gagal memuat detail paket");
      } finally {
        setLoading(false);
      }
    };

    fetchPaket();
  }, [open, paketId]);

  const CategoryBadge = ({ category }) => {
    let color;
    switch (category) {
      case "Kurikulum Nasional": color = "blue"; break;
      case "Kurikulum Internasional": color = "green"; break;
      case "Life Skill": color = "yellow"; break;
      case "Bahasa Asing": color = "red"; break;
      default: color = "gray";
    }
    return (
      <span className={`px-2 py-1 rounded-full text-sm bg-${color}-100 text-${color}-700`}>
        {category}
      </span>
    );
  };

  const LevelBadge = ({ level }) => {
    let color;
    switch (level) {
      case "SD": color = "blue"; break;
      case "SMP": color = "green"; break;
      case "SMA": color = "yellow"; break;
      case "SNBT": color = "purple"; break;
      default: color = "gray";
    }
    return (
      <span className={`px-2 py-1 rounded-full text-sm bg-${color}-100 text-${color}-700`}>
        {level}
      </span>
    );
  };

  if (!open) return null;

  return (
    <Modal
      icon={<FaTag className="text-blue-500" />}
      title="Detail Paket"
      onClose={onClose}
    >
      {loading ? (
        <div className="text-center py-4">Memuat...</div>
      ) : error ? (
        <div className="text-red-600 text-center py-4">{error}</div>
      ) : (
        <div className="flex flex-col gap-4 text-sm">
          <DetailItem icon={<FaTag />} label="Nama Paket">
            {paket?.name}
          </DetailItem>

          <DetailItem icon={<FaFileAlt />} label="Deskripsi">
            <p className="text-gray-600">{paket?.description}</p>
          </DetailItem>

          <div className="grid grid-cols-2 gap-4">
            <DetailItem icon={<FaList />} label="Kategori">
              <CategoryBadge category={paket?.category} />
            </DetailItem>

            <DetailItem icon={<FaGraduationCap />} label="Level">
              <LevelBadge level={paket?.level} />
            </DetailItem>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <DetailItem icon={<FaClock />} label="Jumlah Sesi">
              {paket?.totalSession} sesi
            </DetailItem>

            <DetailItem icon={<FaClock />} label="Durasi per Sesi">
              {paket?.duration} menit
            </DetailItem>
          </div>

          <DetailItem icon={<FaMoneyBillWave />} label="Harga">
            <span className="font-semibold">
              Rp{new Intl.NumberFormat("id-ID").format(paket?.price)}
            </span>
          </DetailItem>

          <DetailItem icon={<FaCheckCircle />} label="Status">
            <span className={`px-2 py-1 rounded-full text-sm ${
              paket?.status === "Aktif" 
                ? "bg-green-100 text-green-700" 
                : "bg-red-100 text-red-700"
            }`}>
              {paket?.status}
            </span>
          </DetailItem>
        </div>
      )}
    </Modal>
  );
}

const DetailItem = ({ icon, label, children }) => (
  <div className="flex flex-col gap-1">
    <div className="flex items-center gap-2 text-gray-500">
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </div>
    <div className="pl-6 text-gray-800">{children}</div>
  </div>
);