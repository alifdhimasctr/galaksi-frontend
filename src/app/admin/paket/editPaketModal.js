/* ---------- EditPaketModal ---------- */
import React, { useEffect, useState } from "react";
import {
  FaTimes, FaTag, FaFileAlt, FaList, 
  FaGraduationCap, FaClock, FaMoneyBillWave,
  FaCheckCircle, FaSave
} from "react-icons/fa";
import axios from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import Modal from "@/app/component/modal";
import Select from "react-select";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export default function EditPaketModal({ open, onClose, paketId, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [msg, setMsg] = useState("");
  const [initialData, setInitialData] = useState(null);

  // Form state
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "Kurikulum Nasional",
    level: "SD",
    totalSession: 12,
    duration: 90,
    price: 0,
    status: "Aktif"
  });

  const categories = [
    "Kurikulum Nasional",
    "Kurikulum Internasional",
    "Life Skill",
    "Bahasa Asing"
  ];

  const levels = ["TK", "SD", "SMP", "SMA", "SNBT", "OTHER"];
  const statusOptions = ["Aktif", "Nonaktif"];

  useEffect(() => {
    if (!open || !paketId) return;

    const fetchData = async () => {
      try {
        const token = Cookies.get("token");
        const { data } = await axios.get(`${API}/paket/${paketId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        setForm({
          name: data.name,
          description: data.description,
          category: data.category,
          level: data.level,
          totalSession: data.totalSession,
          duration: data.duration,
          price: data.price,
          status: data.status
        });
        setInitialData(data);
      } catch (err) {
        toast.error("Gagal memuat data paket");
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, [open, paketId]);

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'number' 
      ? parseInt(e.target.value, 10) 
      : e.target.value;
    
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!form.name || !form.price) {
      return setMsg("Nama dan Harga wajib diisi");
    }

    try {
      setLoading(true);
      const token = Cookies.get("token");
      
      await axios.put(`${API}/paket/${paketId}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      onSuccess();
      toast.success("Paket berhasil diperbarui");
      onClose();
    } catch (err) {
      toast.error("Gagal memperbarui paket");
      setMsg(err?.response?.data?.message || "Gagal menyimpan perubahan");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <Modal
      icon={<FaTag className="text-blue-500" />}
      title="Edit Paket"
      onClose={onClose}
    >
      {fetching ? (
        <div className="text-center py-4">Memuat data paket...</div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-sm">
          {/* Nama Paket */}
          <Label text="Nama Paket">
            <Input
              icon={<FaTag />}
              value={form.name}
              onChange={handleChange("name")}
              required
            />
          </Label>

          {/* Deskripsi */}
          <Label text="Deskripsi">
            <textarea
              value={form.description}
              onChange={handleChange("description")}
              className="p-2 h-20 w-full border border-gray-400 bg-white shadow-xs rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                onChange={handleChange("totalSession")}
                min="1"
              />
            </Label>

            {/* Durasi */}
            <Label text="Durasi per Sesi (menit)">
              <Input
                type="number"
                icon={<FaClock />}
                value={form.duration}
                onChange={handleChange("duration")}
                min="30"
              />
            </Label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Harga */}
            <Label text="Harga (Rp)">
              <Input
                type="number"
                icon={<FaMoneyBillWave />}
                value={form.price}
                onChange={handleChange("price")}
                min="0"
              />
            </Label>

            {/* Status */}
            <Label text="Status">
                <Select
                    options={statusOptions.map((status) => ({
                    value: status,
                    label: status,
                    }))}
                    value={
                    form.status
                        ? { value: form.status, label: form.status }
                        : null
                    }
                    onChange={(selectedOption) =>
                    setForm({ ...form, status: selectedOption?.value || "" })
                    }
                    className="w-full"
                    placeholder="Pilih Status"
                    isClearable
                    isSearchable
                />
            </Label>
          </div>

          {/* Pesan error */}
          {msg && <div className="text-red-600 text-sm">{msg}</div>}

          {/* Tombol Aksi */}
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
              className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60 flex items-center gap-2"
            >
              <FaSave />
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}

// Reuse components from AddPaketModal
const Label = ({ text, children, className = "" }) => (
  <label className={`flex flex-col gap-1 ${className}`}>
    <span className="flex items-center gap-2 font-medium text-gray-700">
      {text}
    </span>
    {children}
  </label>
);

const Input = ({ icon, type = "text", value, onChange, className, ...props }) => (
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