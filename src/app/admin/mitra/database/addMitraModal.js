import React, { useState } from "react";
import {
  FaTimes, FaUser, FaEnvelope, FaPhone, 
  FaMapMarkerAlt, FaCity, FaLandmark, FaCreditCard
} from "react-icons/fa";
import axios from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import Modal from "@/app/component/modal";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export default function AddMitraModal({ open, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    noHp: "",
    bankName: "",
    bankNumber: "",
    status: "active"
  });

  const change = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    
    if (!form.email || !form.name) return setMsg("Email & Nama wajib diisi");
    
    try {
      setLoading(true);
      const token = Cookies.get("token");
      await axios.post(`${API}/register/mitra`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setLoading(false);
      onSuccess();
      toast.success("Mitra berhasil ditambahkan");
      onClose();
    } catch (err) {
      setLoading(false);
      toast.error("Gagal menambah mitra");
      setMsg(err?.response?.data?.message || "Gagal menambah mitra");
    }
  };

  if (!open) return null;
  
  return (
    <Modal
      icon={<FaUser className="text-blue-500" />}
      title="Tambah Mitra"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-sm">
        <div className="grid grid-cols-2 gap-4">
          <Label text="Nama Mitra">
            <Input
              icon={<FaUser />}
              value={form.name}
              onChange={change("name")}
              required
            />
          </Label>

          <Label text="Email">
            <Input
              type="email"
              icon={<FaEnvelope />}
              value={form.email}
              onChange={change("email")}
              required
            />
          </Label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Label text="No. HP">
            <Input
              icon={<FaPhone />}
              type="tel"
              value={form.noHp}
              onChange={change("noHp")}
            />
          </Label>

          <Label text="Kota">
            <Input
              icon={<FaCity />}
              value={form.city}
              onChange={change("city")}
            />
          </Label>
        </div>

        <Label text="Alamat">
          <textarea
            value={form.address}
            onChange={change("address")}
            className="p-2 h-20 w-full border border-gray-400 bg-white shadow-xs rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </Label>

        <div className="grid grid-cols-2 gap-4">
          <Label text="Nama Bank">
            <Input
              icon={<FaLandmark />}
              value={form.bankName}
              onChange={change("bankName")}
            />
          </Label>

          <Label text="Nomor Rekening">
            <Input
              icon={<FaCreditCard />}
              value={form.bankNumber}
              onChange={change("bankNumber")}
            />
          </Label>
        </div>

        {msg && <span className="text-red-600">{msg}</span>}
        <div className="flex justify-end gap-2 mt-2">
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

const Label = ({ text, children, className = "" }) => (
  <label className={`flex flex-col gap-1 ${className}`}>
    <span className="flex items-center gap-2 font-medium text-gray-700">
      {text}
    </span>
    {children}
  </label>
);

const Input = ({ icon, type, value, onChange, className }) => (
  <div className="relative flex gap-2">
    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-800">
      {icon}
    </div>
    <input
      type={type}
      value={value}
      onChange={onChange}
      className={`pl-10 p-2 w-full border border-gray-400 bg-white shadow-xs rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
    />
  </div>
);