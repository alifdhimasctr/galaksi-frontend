/* ---------- AddPaketModal ---------- */
import React, { useState } from "react";
import {
  FaTimes,
  FaTag,
  FaFileAlt,
  FaList,
  FaGraduationCap,
  FaClock,
  FaMoneyBillWave,
} from "react-icons/fa";
import axios from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import Modal from "@/app/component/modal";
import Select from "react-select";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export default function AddPaketModal({ open, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // Form state
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    level: "",
    totalSession: 4,
    duration: 30,
    price: 0,
  });

  const categories = [
    "Kurikulum Nasional",
    "Kurikulum Internasional",
    "Life Skill",
    "Bahasa Asing",
  ];

  const levels = ["TK", "SD", "SMP", "SMA", "SNBT", "OTHER"];

  const change = (key) => (e) => {
    const value =
      e.target.type === "number"
        ? parseInt(e.target.value, 10)
        : e.target.value;

    setForm({ ...form, [key]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    // Validation
    if (!form.name || !form.price) {
      return setMsg("Nama dan Harga wajib diisi");
    }

    try {
      setLoading(true);
      const token = Cookies.get("token");

      await axios.post(`${API}/pakets`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      onSuccess();
      toast.success("Paket berhasil ditambahkan");
      onClose();
    } catch (err) {
      toast.error("Gagal menambah paket");
      setMsg(err?.response?.data?.message || "Gagal menyimpan paket");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <Modal
      icon={<FaTag className="text-blue-500" />}
      title="Tambah Paket"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-sm">
        {/* Nama Paket */}
        <Label text="Nama Paket">
          <Input
            icon={<FaTag />}
            value={form.name}
            onChange={change("name")}
            required
          />
        </Label>

        {/* Deskripsi */}
        <Label text="Deskripsi">
          <textarea
            value={form.description}
            onChange={change("description")}
            className="p-2 h-20 w-full border border-gray-400 bg-white shadow-xs rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            placeholder="Deskripsi Paket"
          />
        </Label>

        <div className="grid grid-cols-2 gap-4">
          {/* Kategori */}
          <Label text="Kategori">
            <Select
              options={categories.map((cat) => ({ value: cat, label: cat }))}
              value={
                form.category
                  ? { value: form.category, label: form.category }
                  : null
              }
              onChange={(selectedOption) =>
                setForm({ ...form, category: selectedOption?.value || "" })
              }
              className="w-full"
              placeholder="Pilih Kategori"
              isClearable
              isSearchable
              required
            />
          </Label>

          {/* Level */}
          <Label text="Level">
            <Select
              options={levels.map((lvl) => ({ value: lvl, label: lvl }))}
              value={
                form.level ? { value: form.level, label: form.level } : null
              }
              onChange={(selectedOption) =>
                setForm({ ...form, level: selectedOption?.value || "" })
              }
              className="w-full"
              placeholder="Pilih Level"
              isClearable
              isSearchable
              required
            />
          </Label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Jumlah Sesi */}
          <Label text="Jumlah Sesi">
            <Input
              type="number"
              icon={<FaFileAlt />}
              value={form.totalSession}
              onChange={change("totalSession")}
              min="4"
              step="4"
              required
            />
          </Label>

          {/* Durasi (menit) */}
          <Label text="Durasi per Sesi (menit)">
            <Input
              type="number"
              icon={<FaClock />}
              value={form.duration}
              onChange={change("duration")}
              min="30"
              step="30"
              required
            />
          </Label>

          {/* Harga */}
          <Label text="Harga (Rp)">
            <Input
              type="number"
              icon={<FaMoneyBillWave />}
              value={form.price}
              onChange={change("price")}
              min="0"
              step="1000"
              required
            />
          </Label>
        </div>

        {/* Error message */}
        {msg && <div className="text-red-600">{msg}</div>}

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 mt-4">
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
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// Reuse Label and Input components from AddSiswaModal
const Label = ({ text, children, className = "" }) => (
  <label className={`flex flex-col gap-1 ${className}`}>
    <span className="flex items-center gap-2 font-medium text-gray-700">
      {text}
    </span>
    {children}
  </label>
);

const Input = ({
  icon,
  type = "text",
  value,
  onChange,
  className,
  ...props
}) => (
  <div className="relative flex gap-2">
    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-800">
      {icon}
    </div>
    <input
      type={type}
      value={value}
      onChange={onChange}
      className={`pl-10 p-2 w-full border border-gray-400 bg-white shadow-xs rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
      {...props}
    />
  </div>
);
