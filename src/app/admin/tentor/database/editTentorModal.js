import React, { useEffect, useState } from "react";
import {
  FaTimes, FaUser, FaEnvelope, FaPhone, FaVenusMars,
  FaUserTie, FaHome, FaCity, FaUniversity, FaSchool, FaMoneyBill,
  FaUpload,
  FaFilePdf
} from "react-icons/fa";
import axios from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import Modal from "@/app/component/modal";
import Select from "react-select";


const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export default function EditTentorModal({ open, onClose, onSuccess, tentorId }) {
  const [tentor, setTentor] = useState(null);
  const [mitras, setMitras] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const [form, setForm] = useState({
    status: "active",
    email: "",
    name: "",
    mitraId: "",
    noHp: "",
    gender: "",
    faculty: "",
    university: "",
    city: "",
    address: "",
    wallet: 0,
    level: [],
    foto: null,
    sim: null,
    bankName: "",
    bankNumber: "",
  });

  const [fotoPreview, setFotoPreview] = useState(null);
  const [simPreview, setSimPreview] = useState(null);

  // Options untuk select
  const statusOptions = [
    { value: 'active', label: 'Aktif' },
    { value: 'nonactive', label: 'Nonaktif' }
  ];

  const genderOptions = [
    { value: 'L', label: 'Laki-Laki' },
    { value: 'P', label: 'Perempuan' }
  ];

  const levelOptions = [
    { value: 'TK', label: 'TK' },
    { value: 'SD', label: 'SD' },
    { value: 'SMP', label: 'SMP' },
    { value: 'SMA', label: 'SMA' }
  ];

  // Styling react-select
  const selectStyles = {
    control: (base) => ({
      ...base,
      minHeight: '44px',
      borderColor: '#e5e7eb',
      '&:hover': { borderColor: '#3b82f6' },
      '&:focus-within': { 
        borderColor: '#3b82f6',
        boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.1)'
      }
    }),
    indicatorSeparator: () => ({ display: 'none' }),
    dropdownIndicator: (base) => ({
      ...base,
      color: '#6b7280',
      padding: '0 12px'
    })
  };

  useEffect(() => {
    if (!open) return;
    // Fetch tentor data for editing
    const fetchTentor = async () => {
      try {
        const token = Cookies.get("token");
        const { data } = await axios.get(`${API}/users/tentor/${tentorId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTentor(data);
        console.log("Tentor data:", data); // Log tentor data for debugging
        setForm({
          ...data,
          status: data.status || "active",
          level: data.level || [],
        });
      } catch (e) {
        toast.error(e);
      }
    };

    // Fetch mitra list
    const fetchMitra = async () => {
      try {
        const token = Cookies.get("token");
        const { data } = await axios.get(`${API}/users/mitra`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMitras(data);
      } catch (e) {
        toast.error(e);
      }
    };

    fetchTentor();
    fetchMitra();
  }, [open, tentorId]);

  const change = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleFileChange = (field) => (e) => {
    const file = e.target.files[0];
    setForm({ ...form, [field]: file });
  };

  const handleLevelChange = (level) => {
    setForm((prevState) => {
      const currentLevels = Array.isArray(prevState.level) ? prevState.level : [];
      const newLevels = currentLevels.includes(level)
        ? currentLevels.filter((l) => l !== level)
        : [...currentLevels, level];
      return { ...prevState, level: newLevels };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!form.email || !form.name || form.level.length === 0) {
      return setMsg("Email, Nama, dan Jenjang harus diisi");
    }

    try {
      setLoading(true);
      const token = Cookies.get("token");

      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("email", form.email);
      formData.append("noHp", form.noHp);
      formData.append("gender", form.gender);
      formData.append("faculty", form.faculty);
      formData.append("university", form.university);
      formData.append("city", form.city);
      formData.append("address", form.address);
      formData.append("wallet", form.wallet);
      formData.append("level", JSON.stringify(form.level));
      formData.append("foto", form.foto);
      formData.append("sim", form.sim);
      formData.append("bankName", form.bankName);
      formData.append("bankNumber", form.bankNumber);
      formData.append("mitraId", form.mitraId);

      const response = await axios.put(`${API}/tentor/${tentorId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setLoading(false);
      onSuccess();
      toast.success("Tentor berhasil diperbarui");
      onClose();
    } catch (err) {
      setLoading(false);
      toast.error("Gagal memperbarui tentor");
      setMsg(err?.response?.data?.message || "Gagal memperbarui tentor");
    }
  };

  if (!open || !tentor) return null;

  return (
    <Modal
      icon={<FaUser className="text-blue-500" />}
      title="Edit Tentor"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Status */}
          <Label text="Status">
            <Select
              options={statusOptions}
              styles={selectStyles}
              value={statusOptions.find(opt => opt.value === form.status)}
              onChange={(selected) => setForm({...form, status: selected.value})}
            />
          </Label>

          {/* ID Tentor */}
          <Label text="ID Tentor">
            <Input 
              value={tentorId}
              icon={<FaUser />}
              disabled 
            />
          </Label>

          {/* Mitra */}
          <Label text="Mitra">
            <Input
              value={tentor.mitra?.name || "-"}
              icon={<FaUserTie />}
              disabled
            />
          </Label>

          {/* Email */}
          <Label text="Email">
            <Input 
              type="email" 
              icon={<FaEnvelope />} 
              value={form.email} 
              onChange={change("email")} 
            />
          </Label>

          {/* Nama Lengkap */}
          <Label text="Nama Lengkap">
            <Input 
              icon={<FaUser />} 
              value={form.name} 
              onChange={change("name")} 
            />
          </Label>

          {/* No. HP */}
          <Label text="No. HP">
            <Input 
              icon={<FaPhone />} 
              value={form.noHp} 
              onChange={change("noHp")} 
            />
          </Label>

          {/* Gender */}
          <Label text="Gender">
            <Select
              options={genderOptions}
              styles={selectStyles}
              value={genderOptions.find(opt => opt.value === form.gender)}
              onChange={(selected) => setForm({...form, gender: selected.value})}
            />
          </Label>

          {/* Fakultas */}
          <Label text="Fakultas">
            <Input 
              icon={<FaUniversity />} 
              value={form.faculty} 
              onChange={change("faculty")} 
            />
          </Label>

          {/* Universitas */}
          <Label text="Universitas">
            <Input 
              icon={<FaSchool />} 
              value={form.university} 
              onChange={change("university")} 
            />
          </Label>

          {/* Kota */}
          <Label text="Kota">
            <Input 
              icon={<FaCity />} 
              value={form.city} 
              onChange={change("city")} 
            />
          </Label>
        </div>

        {/* Alamat */}
        <Label text="Alamat">
          <textarea
            value={form.address}
            onChange={change("address")}
            className="p-3 h-24 w-full border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </Label>

        {/* Jenjang */}
        <Label text="Jenjang yang Diajar">
          <Select
            isMulti
            options={levelOptions}
            styles={selectStyles}
            value={levelOptions.filter(opt => form.level.includes(opt.value))}
            onChange={(selected) => setForm({
              ...form, 
              level: selected.map(opt => opt.value)
            })}
          />
        </Label>

        {/* File Uploads */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Label text="Foto Profil">
            <FileInput 
              preview={form.fotoUrl || fotoPreview}
              onChange={handleFileChange("foto")}
              onRemove={() => {
                setForm(prev => ({...prev, foto: null}));
                setFotoPreview(null);
              }}
            />
          </Label>

          <Label text="Dokumen SIM">
            <FileInput 
              preview={form.simUrl || simPreview}
              onChange={handleFileChange("sim")}
              onRemove={() => {
                setForm(prev => ({...prev, sim: null}));
                setSimPreview(null);
              }}
            />
          </Label>
        </div>

        {/* Informasi Bank */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Label text="Nama Bank">
            <Input 
              icon={<FaMoneyBill />} 
              value={form.bankName} 
              onChange={change("bankName")} 
            />
          </Label>
          
          <Label text="Nomor Rekening">
            <Input 
              value={form.bankNumber} 
              onChange={change("bankNumber")} 
            />
          </Label>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400 flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Menyimpan...
              </>
            ) : 'Simpan Perubahan'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* Helper components */
const Label = ({ text, children, className = "" }) => (
  <label className={`flex flex-col gap-1 ${className}`}>
    <span className="flex items-center gap-2 font-medium text-gray-700">{text}</span>
    {children}
  </label>
);

const Input = ({ icon, type, value, onChange, className, disabled }) => (
  <div className="relative flex gap-2">
    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-800">
      {icon}
    </div>
    <input
      type={type}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`pl-10 p-2 w-full border border-gray-400 ${disabled? "bg-gray-200":"bg-white"} shadow-xs rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
      required
    />
  </div>
);

const FileInput = ({ preview, onChange, onRemove }) => (
  <div className="relative border border-gray-200 rounded-lg p-2 hover:border-blue-500 transition-colors group">
    <input
      type="file"
      onChange={onChange}
      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
    />
    
    {preview ? (
      <div className="relative h-32">
        {typeof preview === 'string' && preview.endsWith('.pdf') ? (
          <div className="flex flex-col items-center justify-center h-full bg-gray-50">
            <FaFilePdf className="text-3xl text-red-500" />
            <span className="mt-2 text-sm">Dokumen PDF</span>
          </div>
        ) : (
          <>
            <img 
              src={preview} 
              alt="Preview" 
              className="w-full h-full object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={onRemove}
              className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm hover:bg-gray-100 transition-colors"
            >
              <FaTimes className="text-red-500 text-sm" />
            </button>
          </>
        )}
      </div>
    ) : (
      <div className="flex items-center justify-center gap-2 p-3 text-gray-500 h-32">
        <FaUpload className="text-sm" />
        <span className="text-sm">Upload File Baru</span>
      </div>
    )}
  </div>
);
