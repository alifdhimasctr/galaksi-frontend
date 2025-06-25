import Cookies from "js-cookie";
import axios from "axios";
import Modal from "@/app/component/modal";
import React, { useEffect, useState } from "react";
import {
  FaUser,
  FaPhone,
  FaVenusMars,
  FaUniversity,
  FaCity,
  FaMoneyBill,
  FaIdBadge,
  FaCheckCircle,
  FaCalendar
} from "react-icons/fa";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export default function DetailTentorModal({ open, onClose, tentorId }) {
  const [tentor, settentor] = useState(null);
  const [mapel, setMapel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    const fetchtentor = async () => {
      try {
        const token = Cookies.get("token");
        const { data } = await axios.get(`${API}/users/tentor/${tentorId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        settentor(data);
      } catch (e) {
        toast.error(e);
      } finally {
        setLoading(false);
      }
    };
    
    fetchtentor();
  }, [open, tentorId]);

  if (loading) return null;
  if (!tentor) return null;
  if (!open) return null;

  const genderLabel = tentor?.gender === 'L' ? 'Laki-laki' : 'Perempuan';

  return (
    <Modal
      icon={<FaUser className="text-blue-500" />}
      title="Detail Tentor"
      onClose={onClose}
    >
      <div className="flex flex-col gap-4 text-sm">
        {/* Header */}
        <div className="flex items-center gap-4 border-b pb-4">
          {tentor?.fotoUrl && (
            <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-blue-100">
              <img
                src={tentor.fotoUrl}
                alt="Foto Profil"
                className="object-cover w-full h-full"
              />
            </div>
          )}
          <div>
            <h2 className="text-xl font-semibold">{tentor?.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge color="blue">ID: {tentor?.id}</Badge>
              <Badge color={tentor?.status === 'active' ? 'green' : 'red'}>
                {tentor?.status}
              </Badge>
            </div>
          </div>
        </div>

        {/* Informasi Utama */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DetailItem icon={<FaVenusMars />} label="Jenis Kelamin">
            {genderLabel}
          </DetailItem>
          <DetailItem icon={<FaPhone />} label="No. HP">
            {tentor?.noHp || '-'}
          </DetailItem>
          <DetailItem icon={<FaUniversity />} label="Fakultas">
            {tentor?.faculty || '-'}
          </DetailItem>
          <DetailItem icon={<FaUniversity />} label="Universitas">
            {tentor?.university || '-'}
          </DetailItem>
          <DetailItem icon={<FaCity />} label="Kota">
            {tentor?.city || '-'}
          </DetailItem>
        </div>

        {/* Level */}
        <DetailItem icon={<FaCheckCircle />} label="Jenjang yang Diajar">
          <div className="flex flex-wrap gap-2">
            {tentor?.level?.map((lvl, index) => (
              <Badge key={index} color="blue">{lvl}</Badge>
            ))}
          </div>
        </DetailItem>
        {/* Mapel */}
        <DetailItem icon={<FaCheckCircle />} label="Mata Pelajaran yang Diajar
          ">
          <div className="flex flex-wrap gap-2">
            {tentor?.mapel?.map((lvl, index) => (
              <Badge key={index} color="blue">{lvl}</Badge>
            ))}
          </div>
        </DetailItem>

        {/* Informasi Bank */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="font-medium text-blue-700 mb-2 flex items-center gap-2">
            <FaMoneyBill /> Informasi Bank
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <DetailItem label="Nama Bank">
              {tentor?.bankName || '-'}
            </DetailItem>
            <DetailItem label="Nomor Rekening">
              {tentor?.bankNumber || '-'}
            </DetailItem>
            <DetailItem label="Saldo">
              {new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR'
              }).format(tentor?.wallet || 0)}
            </DetailItem>
          </div>
        </div>

        {/* Dokumen */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DetailItem icon={<FaIdBadge />} label="Foto Profil">
            {tentor?.fotoUrl ? (
              <div className="relative h-48 w-full rounded-lg overflow-hidden border">
                <img
                  src={tentor.fotoUrl}
                  alt="Foto Profil"
                  className="object-cover w-full h-full"
                />
              </div>
            ) : '-'}
          </DetailItem>
          <DetailItem icon={<FaIdBadge />} label="Dokumen SIM">
            {tentor?.simUrl ? (
              <div className="relative h-48 w-full rounded-lg overflow-hidden border">
                <img
                  src={tentor.simUrl}
                  alt="Dokumen SIM"
                  className="object-cover w-full h-full"
                />
              </div>
            ) : '-'}
          </DetailItem>
          <DetailItem icon={<FaIdBadge />} label="CV">
            {tentor?.cvUrl ? (
              tentor.cvUrl.toLowerCase().endsWith('.pdf') ? (
                <a
                  href={tentor.cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline"
                >
                  Lihat Dokumen PDF
                </a>
              ) : (
                <div className="relative h-48 w-full rounded-lg overflow-hidden border">
                  <img
                    src={tentor.cvUrl}
                    alt="Dokumen CV"
                    className="object-cover w-full h-full"
                  />
                </div>
              )
            ) : '-'}
          </DetailItem>
          <DetailItem icon={<FaIdBadge />} label="KTP">
            {tentor?.ktpUrl ? (
              <div className="relative h-48 w-full rounded-lg overflow-hidden border">
                <img
                  src={tentor.ktpUrl}
                  alt="KTP"
                  className="object-cover w-full h-full"
                />
              </div>
            ) : '-'}
          </DetailItem>
        </div>

        {/* Tanggal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DetailItem icon={<FaCalendar />} label="Tanggal Bergabung">
            {new Date(tentor?.dateJoin).toLocaleString() || '-'}
          </DetailItem>
          <DetailItem icon={<FaCalendar />} label="Terakhir Diupdate">
            {new Date(tentor?.updatedAt).toLocaleString() || '-'}
          </DetailItem>
        </div>
      </div>
    </Modal>
  );
}

const Badge = ({ children, color }) => (
  <span className={`px-2 py-1 rounded-full text-xs bg-${color}-100 text-${color}-700`}>
    {children}
  </span>
);

const DetailItem = ({ icon, label, children }) => (
  <div className="flex flex-col gap-1">
    <div className="flex items-center gap-2 text-gray-500">
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </div>
    <div className="pl-6 text-gray-800">{children}</div>
  </div>
);
