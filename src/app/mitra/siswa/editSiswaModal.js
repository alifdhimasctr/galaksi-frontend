import React, { useEffect, useState } from "react";
import {
  FaTimes, FaUser, FaEnvelope, FaPhone, FaVenusMars,
  FaUserTie, FaHome, FaCity, FaBookOpen, FaSchool,
  FaHandshake
} from "react-icons/fa";
import axios from "axios";
import Cookies from "js-cookie";
import toast, { Toaster } from "react-hot-toast";
import Modal from "@/app/component/modal";
import Select from "react-select";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export default function EditSiswaModal({ open, onClose, onSuccess, siswaId }) {
  const [siswa, setSiswa] = useState(null);
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
    parentName: "",
    parentJob: "",
    address: "",
    city: "",
    purpose: "",
    level: "",
  });

  useEffect(() => {
    if (!open) return;
    // Fetch siswa data for editing
    const fetchSiswa = async () => {
      try {
        const token = Cookies.get("token");
        const { data } = await axios.get(`${API}/users/siswa/${siswaId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSiswa(data);
        setForm({
          ...data,
          status: data.status || "active",
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

    fetchSiswa();
    fetchMitra();
  }, [open, siswaId]);

  const change = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!form.email || !form.name) return setMsg("Email & Nama wajib diisi");

    try {
      setLoading(true);
      const token = Cookies.get("token");

      // Make PUT request to update student
      await axios.put(`${API}/users/siswa/${siswaId}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setLoading(false);
      onSuccess(); // Refresh the table
      toast.success("Siswa berhasil diperbarui");
      onClose(); // Close the modal
    } catch (err) {
      setLoading(false);
      toast.error("Gagal memperbarui siswa");
      setMsg(err?.response?.data?.message || "Gagal memperbarui siswa");
    }
  };

  if (!open || !siswa) return null;

  return (
    <Modal
      icon={<FaUser className="text-blue-500" />}
      title="Edit Siswa"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-sm">
        {/* Email Field */}
        <Label text="Email">
          <Input type="email" icon={<FaEnvelope />} value={form.email} onChange={change("email")} />
        </Label>

        {/* Name Field */}
        <Label text="Nama Lengkap">
          <Input icon={<FaUser />} value={form.name} onChange={change("name")} />
        </Label>

        <div className="grid grid-cols-2 gap-4">
          <Label text="No. HP">
            <Input
              icon={<FaPhone />}
              type="number"
              value={form.noHp}
              onChange={change("noHp")}
            />
          </Label>

          <Label text="Gender">
            <Select
              options={[
                { value: "L", label: "Laki-laki" },
                { value: "P", label: "Perempuan" },
              ]}
              isClearable
              placeholder="Pilih Jenis Kelamin"
              onChange={(selectedOption) =>
                setForm({ ...form, gender: selectedOption?.value || "" })
              }
            />
          </Label>
        

        
          <Label text="Nama Orang Tua">
            <Input
              icon={<FaUserTie />}
              value={form.parentName}
              onChange={change("parentName")}
            />
          </Label>

          <Label text="Pekerjaan Orang Tua">
            <Input
              icon={<FaBookOpen />}
              value={form.parentJob}
              onChange={change("parentJob")}
            />
          </Label>
        </div>

        {/* Address Field */}
        <Label text="Alamat">
          <textarea
            value={form.address}
            onChange={change("address")}
            className="p-2 h-20 w-full border border-gray-400 bg-white shadow-xs rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </Label>

        {/* City Field */}
        <Label text="Kota">
          <Input icon={<FaHome />} value={form.city} onChange={change("city")} />
        </Label>

        {/* Purpose Field */}
        <Label text="Tujuan Ikut Bimbel">
          <textarea
            value={form.purpose}
            onChange={change("purpose")}
            className="p-2 h-20 w-full border border-gray-400 bg-white shadow-xs rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </Label>
<div className="grid grid-cols-2 gap-4">
        {/* Education Level Field */}
        <Label text="Jenjang">
          <select
            value={form.level}
            onChange={change("level")}
            className="p-2 w-full border border-gray-400 bg-white shadow-xs rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {["TK", "SD", "SMP", "SMA"].map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </Label>

        {/* Status Field */}
        <Label text="Status">
          <select
            value={form.status}
            onChange={change("status")}
            className="p-2 w-full border border-gray-400 bg-white shadow-xs rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="active">Aktif</option>
            <option value="nonactive">Nonaktif</option>
          </select>
        </Label>

        </div>
        <div className="grid grid-cols-2 gap-4">
        {/* Mitra Field - Cannot be changed */}
        <Label text="Mitra (Tidak dapat diubah)">
          <Input icon={<FaHandshake />} value={siswa.mitraName} disabled />
        </Label>

        {/* ID Field - Cannot be changed */}
        <Label text="ID Siswa (Tidak dapat diubah)">
          <Input icon={<FaSchool />} value={siswa.id} disabled />
        </Label>
        </div>

        {/* Message & Buttons */}
        {msg && <span className="sm:col-span-2 text-red-600">{msg}</span>}
        <div className="sm:col-span-2 flex justify-end gap-2 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded border bg-gray-100 hover:bg-gray-200"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60"
          >
            {loading ? "Menyimpan…" : "Simpan"}
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
