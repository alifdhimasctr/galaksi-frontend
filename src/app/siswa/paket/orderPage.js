"use client";
import Cookies from "js-cookie";
import React, { useEffect, useState } from "react";
import {
  FaClock,
  FaBook,
} from "react-icons/fa";
import axios from "axios";
import toast from "react-hot-toast";
import Select from "react-select";
import Modal from "@/app/component/modal";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export default function OrderPage({ open, onClose, onSuccess }) {
  const [paketData, setPaketData] = useState([]);
  const [tentorData, setTentorData] = useState([]);
  const [mapelData, setMapelData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [category, setCategory] = useState("");
  const [user, setUser] = useState(null);
  const [level, setLevel] = useState("");

  const [form, setForm] = useState({
    siswaId: "",
    paketId: "",
    tentorId: "",
    meetingDay: [],
    time: "",
    mapel: [],
  });

  const [selectedOptions, setSelectedOptions] = useState({
    category: null,
    paket: null,
    tentor: null,
    meetingDays: [],
    mapels: [],
  });

  // Load user data from cookies when component mounts or opens
  useEffect(() => {
    const loadUser = () => {
      const userData = Cookies.get("user") ? JSON.parse(Cookies.get("user")) : null;
      setUser(userData);
      setLevel(userData?.level || "");
      setForm(prev => ({
        ...prev,
        siswaId: userData?.id || ""
      }));
    };
    
    if (open) {
      loadUser();
    }
  }, [open]);

  const fetchPaketData = async () => {
    if (!user?.level || !category) return;
    try {
      const response = await axios.get(
        `${API}/paket/level-category/${user.level}/${category}`
      );
      setPaketData(response.data);
    } catch (error) {
      toast.error("Gagal mengambil data paket");
      setMsg("Gagal mengambil data paket");
    }
  };

  const fetchTentorData = async () => {
    try {
      if (!level) return;
      const response = await axios.get(`${API}/tentor/level/${level}`);
      setTentorData(response.data);
    } catch (error) {
      toast.error("Gagal mengambil data tentor");
      setMsg("Gagal mengambil data tentor");
    }
  };

  const fetchMapelData = async () => {
    try {
      const response = await axios.get(`${API}/mapel`);
      setMapelData(response.data);
    } catch (error) {
      toast.error("Gagal mengambil data mata pelajaran");
      setMsg("Gagal mengambil data mata pelajaran");
    }
  };

  useEffect(() => {
    if (category) {
      fetchPaketData();
    }
  }, [category, user?.level]); // Add user.level as dependency

  useEffect(() => {
    if (open && level) {
      fetchTentorData();
      fetchMapelData();
    }
  }, [open, level]); // Add level as dependency

  useEffect(() => {
    if (!open) return;

    // Reset form when modal opens
    setForm({
      siswaId: user?.id || "",
      paketId: "",
      tentorId: "",
      meetingDay: [],
      time: "",
      mapel: [],
    });
    setCategory("");
    setSelectedOptions({
      category: null,
      paket: null,
      tentor: null,
      meetingDays: [],
      mapels: [],
    });
    setMsg("");
  }, [open, user]); // Add user as dependency

  const handleSelectChange = (name, selectedOption) => {
    setSelectedOptions(prev => ({
      ...prev,
      [name]: selectedOption
    }));
    
    if (name === 'category') {
      setCategory(selectedOption?.value);
      setForm(prev => ({
        ...prev,
        paketId: "",
        category: selectedOption?.value,
      }));
    } else if (name === 'paket') {
      setForm(prev => ({
        ...prev,
        paketId: selectedOption?.value,
      }));
    } else if (name === 'tentor') {
      setForm(prev => ({
        ...prev,
        tentorId: selectedOption?.value,
      }));
    } else if (name === 'meetingDays') {
      const values = selectedOption.map(option => option.value);
      setForm(prev => ({
        ...prev,
        meetingDay: values,
      }));
    } else if (name === 'mapels') {
      const values = selectedOption.map(option => option.value);
      setForm(prev => ({
        ...prev,
        mapel: values,
      }));
    }
  };

  const handleTimeChange = (e) => {
    setForm(prev => ({
      ...prev,
      time: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    
    // Validation
    if (!category) return setMsg("Pilih kategori terlebih dahulu");
    if (!form.paketId) return setMsg("Pilih paket terlebih dahulu");
    if (!form.tentorId) return setMsg("Pilih tentor terlebih dahulu");
    if (form.meetingDay.length === 0) return setMsg("Pilih hari pertemuan");
    if (!form.time) return setMsg("Pilih waktu mulai les");
    if (form.mapel.length === 0) return setMsg("Pilih mata pelajaran");

    try {
      setLoading(true);
      const orderData = {
        paketId: form.paketId,
        tentorId: form.tentorId,
        meetingDay: form.meetingDay,
        time: form.time,
        mapel: form.mapel,
      };

      const response = await axios.post(`${API}/order/${form.siswaId}`, orderData);
      toast.success("Order berhasil dibuat");
      onSuccess(response.data);
      onClose();
    } catch (error) {
      toast.error("Gagal membuat order");
      setMsg(error?.response?.data?.message || "Gagal membuat order");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <Modal
      icon={<FaBook className="text-blue-500" />}
      title="Buat Order Baru"
      onClose={onClose}
      closeOnOverlayClick={false}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-sm">
        <div className="grid grid-cols-2 gap-4">
          {/* Category */}
          <Label text="Kategori">
            <Select
              options={[
                { value: "Kurikulum Nasional", label: "Kurikulum Nasional" },
                { value: "Kurikulum Internasional", label: "Kurikulum Internasional" },
                { value: "Life Skill", label: "Life Skill" },
                { value: "Bahasa Asing", label: "Bahasa Asing" },
              ]}
              value={selectedOptions.category}
              onChange={(selectedOption) => handleSelectChange('category', selectedOption)}
              placeholder="Pilih Kategori"
              isClearable
              isSearchable
              styles={selectStyles}
            />
          </Label>

          {/* Paket */}
          <Label text="Paket">
            <Select
              options={paketData.map((paket) => ({
                value: paket.id,
                label: (
                  <div className="flex flex-col">
                    <div className="font-semibold">{paket.name}</div>
                    <div className="text-xs text-gray-500">
                      {paket.category} • {paket.totalSession} pertemuan
                    </div>
                    <div className="text-xs text-gray-500">
                      {paket.duration} menit • {formatRupiah(paket.price)}
                    </div>
                  </div>
                ),
              }))}
              value={selectedOptions.paket}
              onChange={(selectedOption) => handleSelectChange('paket', selectedOption)}
              placeholder="Pilih Paket"
              isClearable
              isSearchable
              styles={selectStyles}
              isDisabled={!category}
            />
          </Label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Tentor */}
          <Label text="Tentor">
            <Select
              options={tentorData.map((tentor) => ({
                value: tentor.id,
                label: (
                  <div className="flex flex-row items-center">
                    <img
                      src={tentor.fotoUrl}
                      alt={tentor.name}
                      className="w-15 h-15 rounded-full mr-2"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/images/default-avatar.png";
                      }
                      }
                    />
                    <div  className="flex flex-col">
                      <div className="font-semibold text-xs text-left">{tentor.name}</div>
                      <div className="font-medium text-xs text-left">{tentor.id}</div>
                      <div className="font-medium text-xs text-left">
                        {tentor.faculty} - {tentor.university}

                      </div>


                      
                    </div>

                    
                  </div>
                )
              }))}
              value={selectedOptions.tentor}
              onChange={(selectedOption) => handleSelectChange('tentor', selectedOption)}
              placeholder="Pilih Tentor"
              isClearable
              isSearchable
              styles={selectStyles}
            />
          </Label>

          {/* Time */}
          <Label text="Waktu Mulai Les">
            <div className="relative flex gap-2">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-800">
                <FaClock />
              </div>
              <input
                type="time"
                value={form.time}
                onChange={handleTimeChange}
                className="pl-10 p-2 w-full border border-gray-400 bg-white shadow-xs rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </Label>
        </div>
        <div className="grid grid-cols-2 gap-4">
        {/* Meeting Day */}
        <Label text="Hari Pertemuan">
          <Select
            options={[
              { value: "Senin", label: "Senin" },
              { value: "Selasa", label: "Selasa" },
              { value: "Rabu", label: "Rabu" },
              { value: "Kamis", label: "Kamis" },
              { value: "Jumat", label: "Jumat" },
              { value: "Sabtu", label: "Sabtu" },
              { value: "Minggu", label: "Minggu" },
            ]}
            value={selectedOptions.meetingDays}
            isMulti
            onChange={(selectedOptions) => handleSelectChange('meetingDays', selectedOptions)}
            placeholder="Pilih Hari Pertemuan"
            isClearable
            isSearchable
            styles={selectStyles}
          />
        </Label>

        {/* Mapel */}
        <Label text="Mata Pelajaran">
          <Select
            options={mapelData.map((mapel) => ({
              value: mapel.id,
              label: mapel.name,
            }))}
            value={selectedOptions.mapels}
            isMulti
            onChange={(selectedOptions) => handleSelectChange('mapels', selectedOptions)}
            placeholder="Pilih Mata Pelajaran"
            isClearable
            isSearchable
            styles={selectStyles}
          />
        </Label>
        </div>

        {/* Message and buttons */}
        {msg && <span className="text-red-600 text-sm">{msg}</span>}
        <div className="flex justify-end gap-2 mt-10">
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
            {loading ? "Menyimpan..." : "Simpan Order"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* Helper Components */
const Label = ({ text, children, className = "" }) => (
  <label className={`flex flex-col gap-1 ${className}`}>
    <span className="flex items-center gap-2 font-medium text-gray-700">
      {text}
    </span>
    {children}
  </label>
);

const selectStyles = {
  control: (base) => ({
    ...base,
    borderColor: "rgb(156, 163, 175)",
    minHeight: "42px",
    boxShadow: "none",
    "&:hover": {
      borderColor: "rgb(59, 130, 246)",
    },
  }),
  menu: (base) => ({
    ...base,
    zIndex: 9999,
  }),
};

const formatRupiah = (amount) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};