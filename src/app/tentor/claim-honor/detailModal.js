import Modal from '@/app/component/modal'
import React, { useEffect, useState } from 'react'
import { FaCalendarAlt, FaMoneyBill, FaUserGraduate, FaUserTie } from 'react-icons/fa'
import axios from 'axios'
import Cookies from 'js-cookie'
import toast from 'react-hot-toast'

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export default function DetailModal({ open, onClose, honorId }) {
  const [honor, setHonor] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !honorId) return;
    
    const fetchHonorDetail = async () => {
      try {
        setLoading(true);
        const token = Cookies.get("token");
        const { data } = await axios.get(`${API}/honor/id/${honorId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setHonor(data);
      } catch (error) {
        toast.error("Gagal memuat detail honor");
      } finally {
        setLoading(false);
      }
    };

    fetchHonorDetail();
  }, [open, honorId]);

  if (!open) return null;

  return (
    <Modal
      title="Detail Honor"
      onClose={onClose}
    >
      {loading ? (
        <div className="text-center py-6">Memuat detail honor...</div>
      ) : honor ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <DetailItem 
              icon={<FaMoneyBill className="text-green-500" />}
              label="ID Honor"
              value={honor.id}
            />
            <DetailItem 
              icon={<FaMoneyBill className="text-green-500" />}
              label="Total Honor"
              value={`Rp ${parseInt(honor.total).toLocaleString('id-ID')}`}
            />
            <DetailItem 
              icon={<FaUserTie className="text-blue-500" />}
              label="Tentor"
              value={honor.tentor?.name || '-'}
            />
            <DetailItem 
              icon={<FaUserGraduate className="text-purple-500" />}
              label="Siswa"
              value={honor.siswa?.name || '-'}
            />
          </div>

          <div>
            <h3 className="font-medium flex items-center gap-2 mb-2">
              <FaCalendarAlt className="text-gray-500" />
              Jadwal Mengajar
            </h3>
            <div className="bg-gray-50 rounded-lg p-3 max-h-40 overflow-y-auto">
              {honor.jadwals && honor.jadwals.length > 0 ? (
                <ul className="space-y-2">
                  {honor.jadwals.map((jadwal, index) => (
                    <li key={index} className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0">
                      <span className="font-medium">{jadwal.dayName}</span>
                      <div className="text-right">
                        <p>{jadwal.date}</p>
                        <p className="text-sm text-gray-500">{jadwal.time}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-center py-2">Tidak ada jadwal</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-6 text-red-500">Gagal memuat data honor</div>
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