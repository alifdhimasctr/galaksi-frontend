import Modal from '@/app/component/modal'
import React, { useEffect, useState } from 'react'
import { FaBuilding, FaMoneyBill, FaUserGraduate, FaBox } from 'react-icons/fa'
import axios from 'axios'
import Cookies from 'js-cookie'
import toast from 'react-hot-toast'

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export default function DetailModal({ open, onClose, proshareId }) {
  const [proshare, setProshare] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !proshareId) return;
    
    const fetchProshareDetail = async () => {
      try {
        setLoading(true);
        const token = Cookies.get("token");
        const { data } = await axios.get(`${API}/proshare/id/${proshareId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProshare(data);
      } catch (error) {
        toast.error("Gagal memuat detail proshare");
      } finally {
        setLoading(false);
      }
    };

    fetchProshareDetail();
  }, [open, proshareId]);

  if (!open) return null;

  return (
    <Modal
      title="Detail Proshare"
      onClose={onClose}
    >
      {loading ? (
        <div className="text-center py-6">Memuat detail proshare...</div>
      ) : proshare ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <DetailItem 
              icon={<FaMoneyBill className="text-green-500" />}
              label="ID Proshare"
              value={proshare.id}
            />
            <DetailItem 
              icon={<FaMoneyBill className="text-green-500" />}
              label="Total Proshare"
              value={`Rp ${parseInt(proshare.total).toLocaleString('id-ID')}`}
            />
            <DetailItem 
              icon={<FaBuilding className="text-blue-500" />}
              label="Mitra"
              value={proshare.mitra?.name || '-'}
            />
            <DetailItem 
              icon={<FaUserGraduate className="text-purple-500" />}
              label="Siswa"
              value={proshare.siswa?.name || '-'}
            />
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium flex items-center gap-2 mb-2">
              <FaBox className="text-gray-500" />
              Informasi Paket
            </h3>
            {proshare.paket ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm text-gray-500">Nama Paket</p>
                  <p className="font-medium">{proshare.paket.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Harga Paket</p>
                  <p className="font-medium">Rp {parseInt(proshare.paket.price).toLocaleString('id-ID')}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Tidak ada informasi paket</p>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-6 text-red-500">Gagal memuat data proshare</div>
      )}
    </Modal>
  );
}

const DetailItem = ({ icon, label, value }) => (
  <div className="border rounded-lg p-3">
    <div className="flex items-center gap-2 text-gray-500 mb-1">
      {icon}
      <span className="text-sm">{label}</span>
    </div>
    <p className="font-medium">{value}</p>
  </div>
);