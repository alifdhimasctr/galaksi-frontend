"use client";
import Cookies from "js-cookie";
import React, { useEffect, useState } from "react";
import { FaClock, FaBook, FaUserGraduate } from "react-icons/fa";
import axios from "axios";
import toast from "react-hot-toast";
import Select from "react-select";
import Modal from "@/app/component/modal";


const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export default function AdminOrderPage({ open, onClose, onSuccess }) {
  const [siswaData, setSiswaData] = useState([]);
  const [paketData, setPaketData] = useState([]);
  const [tentorData, setTentorData] = useState([]);
  const [mapelData, setMapelData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [category, setCategory] = useState("");
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
    siswa: null,
    category: null,
    paket: null,
    tentor: null,
    meetingDays: [],
    mapels: [],
  });

  // Fetch siswa data when modal opens
  useEffect(() => {
    const fetchSiswaData = async () => {
      try {
        const response = await axios.get(`${API}/users/siswa`, {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        });
        setSiswaData(response.data);
      } catch (error) {
        toast.error("Gagal mengambil data siswa");
        setMsg("Gagal mengambil data siswa");
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

    if (open) {
      fetchSiswaData();
      fetchMapelData();

      // Reset form
      setForm({
        siswaId: "",
        paketId: "",
        tentorId: "",
        meetingDay: [],
        time: "",
        mapel: [],
      });
      setCategory("");
      setLevel("");
      setSelectedOptions({
        siswa: null,
        category: null,
        paket: null,
        tentor: null,
        meetingDays: [],
        mapels: [],
      });
      setMsg("");
    }
  }, [open]);

  const fetchPaketData = async () => {
    if (!level || !category) return;
    try {
      const response = await axios.get(
        `${API}/paket/level-category/${level}/${category}`
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

  useEffect(() => {
    if (category && level) {
      fetchPaketData();
    }
  }, [category, level]);

  useEffect(() => {
    if (level) {
      fetchTentorData();
    }
  }, [level]);

  const handleSelectChange = (name, selectedOption) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [name]: selectedOption,
    }));

    if (name === "siswa") {
      const selectedSiswa = siswaData.find(
        (siswa) => siswa.id === selectedOption.value
      );
      setLevel(selectedSiswa?.level || "");

      setForm((prev) => ({
        ...prev,
        siswaId: selectedOption?.value,
      }));
    } else if (name === "category") {
      setCategory(selectedOption?.value);
      setForm((prev) => ({
        ...prev,
        paketId: "",
        category: selectedOption?.value,
      }));
    } else if (name === "paket") {
      setForm((prev) => ({
        ...prev,
        paketId: selectedOption?.value,
      }));
    } else if (name === "tentor") {
      setForm((prev) => ({
        ...prev,
        tentorId: selectedOption?.value,
      }));
    } else if (name === "meetingDays") {
      const values = selectedOption.map((option) => option.value);
      setForm((prev) => ({
        ...prev,
        meetingDay: values,
      }));
    } else if (name === "mapels") {
      const values = selectedOption.map((option) => option.value);
      setForm((prev) => ({
        ...prev,
        mapel: values,
      }));
    }
  };

  const handleTimeChange = (e) => {
    setForm((prev) => ({
      ...prev,
      time: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    // Validation
    if (!form.siswaId) return setMsg("Pilih siswa terlebih dahulu");
    if (!category) return setMsg("Pilih kategori terlebih dahulu");
    if (!form.paketId) return setMsg("Pilih paket terlebih dahulu");
    if (!form.tentorId) return setMsg("Pilih tentor terlebih dahulu");
    if (form.meetingDay.length === 0) return setMsg("Pilih hari pertemuan");
    if (!form.time) return setMsg("Pilih waktu mulai les");
    if (form.mapel.length === 0) return setMsg("Pilih mata pelajaran");

    try {
      setLoading(true);
      const orderData = {
        siswaId: form.siswaId,
        paketId: form.paketId,
        tentorId: form.tentorId,
        meetingDay: form.meetingDay,
        time: form.time,
        mapel: form.mapel,
      };

        const response = await axios.post(`${API}/order-by-admin`, orderData, {
        headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
        },
        });

      toast.success("Order berhasil dibuat");
      onSuccess(response.data);
      onClose();
    } catch (error) {
      toast.error("Gagal membuat order", error?.response?.message);
        console.error("Error creating order:", error);
      setMsg(error?.response?.data?.message || "Gagal membuat order");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <Modal
      icon={<FaBook className="text-blue-500" />}
      title="Buat Order Baru (Admin)"
      onClose={onClose}
      closeOnOverlayClick={false}
      className="w-full max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-sm">
        {/* Siswa Selection */}
        <Label text="Siswa">
          <Select
            options={siswaData.map((siswa) => ({
              value: siswa.id,
              label: (
                <div className="flex items-center gap-3">
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10 flex items-center justify-center">
                    <FaUserGraduate className="text-gray-600" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold">{siswa.name}</span>
                    <span className="text-xs text-gray-500">
                      {siswa.level} • {siswa.id}
                    </span>
                  </div>
                </div>
              ),
            }))}
            value={selectedOptions.siswa}
            onChange={(selectedOption) =>
              handleSelectChange("siswa", selectedOption)
            }
            placeholder="Pilih Siswa"
            isClearable
            isSearchable
            styles={selectStyles}
          />
        </Label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Category */}
          <Label text="Kategori">
            <Select
              options={[
                { value: "Kurikulum Nasional", label: "Kurikulum Nasional" },
                {
                  value: "Kurikulum Internasional",
                  label: "Kurikulum Internasional",
                },
                { value: "Life Skill", label: "Life Skill" },
                { value: "Bahasa Asing", label: "Bahasa Asing" },
              ]}
              value={selectedOptions.category}
              onChange={(selectedOption) =>
                handleSelectChange("category", selectedOption)
              }
              placeholder="Pilih Kategori"
              isClearable
              isSearchable
              styles={selectStyles}
              isDisabled={!form.siswaId}
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
              onChange={(selectedOption) =>
                handleSelectChange("paket", selectedOption)
              }
              placeholder="Pilih Paket"
              isClearable
              isSearchable
              styles={selectStyles}
              isDisabled={!category}
            />
          </Label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tentor */}
          <Label text="Tentor">
            <Select
              options={tentorData.map((tentor) => ({
                value: tentor.id,
                label: (
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10 flex items-center justify-center">
                      <FaUserGraduate className="text-gray-600" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold">{tentor.name}</span>
                      <span className="text-xs text-gray-500">
                        {tentor.faculty} • {tentor.university}
                      </span>
                    </div>
                  </div>
                ),
              }))}
              value={selectedOptions.tentor}
              onChange={(selectedOption) =>
                handleSelectChange("tentor", selectedOption)
              }
              placeholder="Pilih Tentor"
              isClearable
              isSearchable
              styles={selectStyles}
              isDisabled={!form.siswaId}
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
            onChange={(selectedOptions) =>
              handleSelectChange("meetingDays", selectedOptions)
            }
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
            onChange={(selectedOptions) =>
              handleSelectChange("mapels", selectedOptions)
            }
            placeholder="Pilih Mata Pelajaran"
            isClearable
            isSearchable
            styles={selectStyles}
          />
        </Label>

        {/* Message and buttons */}
        {msg && <span className="text-red-600 text-sm">{msg}</span>}
        <div className="flex justify-end gap-2 mt-4 border-t pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded border bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60 transition-colors"
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
    minHeight: "44px",
    boxShadow: "none",
    "&:hover": {
      borderColor: "rgb(59, 130, 246)",
    },
  }),
  menu: (base) => ({
    ...base,
    zIndex: 9999,
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: "#e0f2fe",
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: "#0369a1",
  }),
};

const formatRupiah = (amount) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};
