/* ---------- AddSiswaModal ---------- */
import React, { useEffect, useState } from "react";
import {
  FaTimes,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaVenusMars,
  FaUserTie,
  FaHome,
  FaCity,
  FaBookOpen,
  FaSchool,
  FaHandshake,
} from "react-icons/fa";
import axios from "axios";
import Cookies from "js-cookie";
import toast, { Toaster } from "react-hot-toast";
import Modal from "@/app/component/modal";
import Select from "react-select";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
const user = JSON.parse(Cookies.get("user") || "{}");

export default function AddSiswaModal({ open, onClose, onSuccess }) {
  const [mitras, setMitras] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  /* form state */
  const [form, setForm] = useState({
    status: "active",
    email: "",
    name: "",
    mitraId: user.id  || "", // default to logged-in user's ID
    noHp: "",
    gender: "",
    parentName: "",
    parentJob: "",
    address: "",
    city: "",
    purpose: "",
    level: "",
  });



  const change = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    /* minimal check */
    if (!form.email || !form.name) return setMsg("Email & Nama wajib diisi");
    try {
      setLoading(true);
      const token = Cookies.get("token");
      await axios.post(`${API}/register/siswa`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setLoading(false);
      onSuccess(); // refresh table
      toast.success("Siswa berhasil ditambahkan");
      onClose(); // close modal
    } catch (err) {
      setLoading(false);
      toast.error("Gagal menambah siswa");
      setMsg(err?.response?.data?.message || "Gagal menambah siswa");
    }
  };

  if (!open) return null;
  return (
    <Modal
      icon={<FaUser className="text-blue-500" />}
      title="Tambah Siswa"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-sm">
        {/* each field */}
        <Label text="Email">
          <Input
            type={"email"}
            icon={<FaEnvelope />}
            value={form.email}
            onChange={change("email")}
          />
        </Label>

        <Label text="Nama Lengkap">
          <Input
            icon={<FaUser />}
            value={form.name}
            onChange={change("name")}
          />
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

        <Label text="Alamat">
          <textarea
            value={form.address}
            onChange={change("address")}
            className="p-2 h-20  w-full border border-gray-400 bg-white shadow-xs rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </Label>

        <Label text="Kota">
          <Input
            icon={<FaHome />}
            value={form.city}
            onChange={change("city")}
          />
        </Label>

        <Label text="Tujuan Ikut Bimbel" className="sm:col-span-2">
          <textarea
            value={form.purpose}
            onChange={change("purpose")}
            className="p-2 h-20  w-full border border-gray-400 bg-white shadow-xs rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </Label>

        <div className="grid grid-cols-2 gap-4">
          <Label text="Jenjang">
            <Select
              options={[
                { value: "TK", label: "TK" },
                { value: "SD", label: "SD" },
                { value: "SMP", label: "SMP" },
                { value: "SMA", label: "SMA" },
              ]}
              isClearable
              placeholder="Pilih Jenjang"
              onChange={(selectedOption) =>
                setForm({ ...form, level: selectedOption?.value || "" })
              }
              />
          </Label>

          <Label  text="Mitra">
            <Input
              icon={<FaHandshake />}
              disabled={true} // Mitra ID is set to the logged-in user's ID
              value={form.mitraId}
              onChange={change("mitraId")}
              className={"cursor-not-allowed text-gray-500"}
            />
          </Label>
            
        </div>

        {/* message & buttons */}
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

/* helper */
const Label = ({ text, children, className = "" }) => (
  <label className={`flex flex-col gap-1 ${className}`}>
    <span className="flex items-center gap-2 font-medium text-gray-700">
      {text}
    </span>
    {children}
  </label>
);

const Input = ({ icon, type, value, onChange, className, disabled }) => (
  <div className="relative flex gap-2">
    {/* Icon di dalam input */}
    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-800">
      {icon}
    </div>
    <input
      type={type}
      value={value}
      onChange={onChange}
      disabled  ={disabled}
      className={`pl-10 p-2 w-full border border-gray-400 bg-white shadow-xs rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
      required
    />
  </div>
);
