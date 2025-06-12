import React, { useEffect, useState } from "react";
import {
  FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt,
  FaTimes, FaCity, FaLandmark, FaCreditCard, FaUsers, FaCalendarAlt, FaWallet
} from "react-icons/fa";
import axios from "axios";
import Cookies from "js-cookie";
import Modal from "@/app/component/modal";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export default function DetailMitraModal({ open, onClose, mitraId }) {
  const [mitra, setMitra] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !mitraId) return;

    const fetchMitra = async () => {
      try {
        const token = Cookies.get("token");
        const { data } = await axios.get(`${API}/users/mitra/${mitraId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMitra(data);
      } catch (e) {
        setError("Gagal memuat data mitra");
      } finally {
        setLoading(false);
      }
    };
    
    fetchMitra();
  }, [open, mitraId]);

  const StatusBadge = ({ status }) => {
    const statusMap = {
      'active': { label: 'Aktif', color: 'green' },
      'nonactive': { label: 'Nonaktif', color: 'red' }
    };
    
    const { label, color } = statusMap[status] || { label: '-', color: 'gray' };
    
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
      title="Detail Mitra"
      onClose={onClose}
    >
      {loading ? (
        <div className="text-center py-4">Memuat...</div>
      ) : error ? (
        <div className="text-red-600 text-center py-4">{error}</div>
      ) : (
        <div className="flex flex-col gap-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <DetailItem icon={<FaUser />} label="ID Mitra">
              {mitra?.id}
            </DetailItem>

            <DetailItem icon={<FaUser />} label="Status">
              <StatusBadge status={mitra?.status} />
            </DetailItem>
          </div>

          <DetailItem icon={<FaUser />} label="Nama Mitra">
            {mitra?.name}
          </DetailItem>

          <DetailItem icon={<FaEnvelope />} label="Email">
            {mitra?.email}
          </DetailItem>

          <div className="grid grid-cols-2 gap-4">
            <DetailItem icon={<FaPhone />} label="No. HP">
              {mitra?.noHp || '-'}
            </DetailItem>

            <DetailItem icon={<FaCity />} label="Kota">
              {mitra?.city || '-'}
            </DetailItem>
          </div>

          <DetailItem icon={<FaMapMarkerAlt />} label="Alamat">
            {mitra?.address || '-'}
          </DetailItem>

          <div className="grid grid-cols-2 gap-4">
            <DetailItem icon={<FaLandmark />} label="Nama Bank">
              {mitra?.bankName || '-'}
            </DetailItem>

            <DetailItem icon={<FaCreditCard />} label="Nomor Rekening">
              {mitra?.bankNumber || '-'}
            </DetailItem>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <DetailItem icon={<FaWallet />} label="Saldo">
              {mitra?.wallet ? `Rp ${mitra.wallet.toLocaleString()}` : '-'}
            </DetailItem>

            <DetailItem icon={<FaCalendarAlt />} label="Tanggal Bergabung">
              {mitra?.dateJoin ? new Date(mitra.dateJoin).toLocaleDateString() : '-'}
            </DetailItem>
          </div>

          <DetailItem icon={<FaUsers />} label="Jumlah Siswa">
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              {mitra?.siswa?.length || 0} siswa
            </span>
          </DetailItem>

          {mitra?.siswa?.length > 0 && (
            <div className="mt-2">
              <h3 className="font-medium mb-2">Daftar Siswa:</h3>
              <div className="max-h-40 overflow-y-auto">
                <ul className="space-y-1">
                  {mitra.siswa.map(siswa => (
                    <li key={siswa.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <span className="font-medium">{siswa.id}</span>
                      <span>-</span>
                      <span>{siswa.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
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