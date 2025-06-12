import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import {
  FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt,
  FaTimes, FaVenusMars, FaUserTie, FaBookOpen,
  FaSchool, FaHandshake, FaIdBadge, FaTransgender,
  FaHome, FaCity
} from "react-icons/fa";
import axios from "axios";
import Modal from "@/app/component/modal";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export default function DetailSiswaModal({ open, onClose, siswaId }) {
  const [siswa, setSiswa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !siswaId) return;

    const fetchSiswa = async () => {
      try {
        const token = Cookies.get("token");
        const { data } = await axios.get(`${API}/users/siswa/${siswaId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSiswa(data);
      } catch (e) {
        setError("Gagal memuat data siswa");
      } finally {
        setLoading(false);
      }
    };
    
    fetchSiswa();
  }, [open, siswaId]);

  const GenderBadge = ({ gender }) => {
    const genderMap = {
      'L': { label: 'Laki-laki', color: 'blue' },
      'P': { label: 'Perempuan', color: 'pink' }
    };
    
    const { label, color } = genderMap[gender] || { label: '-', color: 'gray' };
    
    return (
      <span className={`px-2 py-1 rounded-full text-sm bg-${color}-100 text-${color}-700`}>
        {label}
      </span>
    );
  };

  if (!open) return null;

  return (
    <Modal
      icon={<FaUser className="text-blue-500" />}
      title="Detail Siswa"
      onClose={onClose}
    >
      {loading ? (
        <div className="text-center py-4">Memuat...</div>
      ) : error ? (
        <div className="text-red-600 text-center py-4">{error}</div>
      ) : (
        <div className="flex flex-col gap-4 text-sm">
          {/* Informasi Utama */}
          <div className="grid grid-cols-2 gap-4">
            <DetailItem icon={<FaUser />} label="Nama Lengkap">
              {siswa?.name}
            </DetailItem>

            <DetailItem icon={<FaIdBadge />} label="ID Siswa">
              {siswa?.id}
            </DetailItem>
          </div>

          {/* Kontak */}
          <div className="grid grid-cols-2 gap-4">
            <DetailItem icon={<FaEnvelope />} label="Email">
              {siswa?.email}
            </DetailItem>

            <DetailItem icon={<FaPhone />} label="No. HP">
              {siswa?.noHp || '-'}
            </DetailItem>
          </div>

          {/* Data Pribadi */}
          <div className="grid grid-cols-2 gap-4">
            <DetailItem icon={<FaVenusMars />} label="Jenis Kelamin">
              <GenderBadge gender={siswa?.gender} />
            </DetailItem>

            <DetailItem icon={<FaSchool />} label="Jenjang">
              <span className="px-2 py-1 rounded-full text-sm bg-gray-100 text-gray-700">
                {siswa?.level}
              </span>
            </DetailItem>
          </div>

          {/* Alamat */}
          <div className="grid grid-cols-2 gap-4">
            <DetailItem icon={<FaHome />} label="Alamat">
              <p className="text-gray-600">{siswa?.address}</p>
            </DetailItem>

            <DetailItem icon={<FaCity />} label="Kota">
              {siswa?.city || '-'}
            </DetailItem>
          </div>

          {/* Orang Tua */}
          <div className="grid grid-cols-2 gap-4">
            <DetailItem icon={<FaUserTie />} label="Nama Orang Tua">
              {siswa?.parentName || '-'}
            </DetailItem>

            <DetailItem icon={<FaBookOpen />} label="Pekerjaan Orang Tua">
              {siswa?.parentJob || '-'}
            </DetailItem>
          </div>

          {/* Informasi Tambahan */}
          <div className="grid grid-cols-2 gap-4">
            <DetailItem icon={<FaHandshake />} label="Mitra">
              {siswa?.mitraName || '-'}
            </DetailItem>

            <DetailItem icon={<FaSchool />} label="Tujuan Bimbel">
              <p className="text-gray-600">{siswa?.purpose || '-'}</p>
            </DetailItem>
          </div>
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