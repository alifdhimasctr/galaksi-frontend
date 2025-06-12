"use client";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import toast from "react-hot-toast";
import Select from "react-select";
import Modal from "@/app/component/modal";
import { FaClock, FaBook, FaTimes } from "react-icons/fa";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export default function EditModal({ open, onClose, onSuccess, orderId }) {
  const [paketData, setPaketData] = useState([]);
  const [tentorData, setTentorData] = useState([]);
  const [mapelData, setMapelData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [level, setLevel] = useState(null);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({
    paketId: "",
    tentorId: "",
    meetingDay: [],
    time: "",
    mapel: [],
  });
  const [selectedOptions, setSelectedOptions] = useState({
    paket: null,
    tentor: null,
    meetingDays: [],
    mapels: [],
  });

  // Load order data for editing
  useEffect(() => {
    if (!open || !orderId) return;

    const fetchOrder = async () => {
      try {
        const token = Cookies.get("token");
        const { data: order } = await axios.get(`${API}/order/id/${orderId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (order?.siswa?.level) {
            setLevel(order.siswa.level);
        }
        console.log(order?.siswa?.level);

        // Set form state
        setForm({
          paketId: order.paket.id,
          tentorId: order.tentor?.id || "",
          meetingDay: order.meetingDay,
          time: order.time,
          mapel: order.mapel.map((m) => m.id),
        });

        // Set selected options for selects
        setSelectedOptions({
          paket: { value: order.paket.id, label: order.paket.name },
          tentor: order.tentor
            ? { value: order.tentor.id, label: order.tentor.name }
            : null,
          meetingDays: order.meetingDay.map((day) => ({
            value: day,
            label: day,
          })),
          mapels: order.mapel.map((m) => ({ value: m.id, label: m.name })),
        });

        console.log("Order data fetched:", order);
      } catch (error) {
        toast.error("Gagal mengambil data order");
        setMsg("Gagal mengambil data order");
      }
    };

    fetchOrder();
  }, [open, orderId]);

  // Fetch paket, tentor, and mapel data
useEffect(() => {
    if (!open || !level) return;

    const fetchPaket = async () => {
        try {
            const response = await axios.get(`${API}/paket/level/${level}`);
            setPaketData(response.data);
        } catch (error) {
            toast.error("Gagal mengambil data paket");
            setMsg("Gagal mengambil data paket");
        }
    };

    const fetchTentor = async () => {
        try {
            const response = await axios.get(`${API}/tentor/level/${level}`);
            setTentorData(response.data);
        } catch (error) {
            toast.error("Gagal mengambil data tentor");
            setMsg("Gagal mengambil data tentor");
        }
    };

    const fetchMapel = async () => {
        try {
            const response = await axios.get(`${API}/mapel`);
            setMapelData(response.data);
        } catch (error) {
            toast.error("Gagal mengambil data mata pelajaran");
            setMsg("Gagal mengambil data mata pelajaran");
        }
    };

    fetchPaket();
    fetchTentor();
    fetchMapel();
}, [open, level]);

  const handleSelectChange = (name, selectedOption) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [name]: selectedOption,
    }));

    if (name === "paket") {
      setForm((prev) => ({
        ...prev,
        paketId: selectedOption?.value || "",
      }));
    } else if (name === "tentor") {
      setForm((prev) => ({
        ...prev,
        tentorId: selectedOption?.value || "",
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
    if (!form.paketId) return setMsg("Pilih paket terlebih dahulu");
    if (!form.tentorId) return setMsg("Pilih tentor terlebih dahulu");
    if (form.meetingDay.length === 0) return setMsg("Pilih hari pertemuan");
    if (!form.time) return setMsg("Pilih waktu mulai les");
    if (form.mapel.length === 0) return setMsg("Pilih mata pelajaran");

    try {
      setLoading(true);
      const token = Cookies.get("token");
      const orderData = {
        paketId: form.paketId,
        tentorId: form.tentorId,
        meetingDay: form.meetingDay,
        time: form.time,
        mapel: form.mapel,
      };

      await axios.put(`${API}/order/${orderId}`, orderData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onSuccess(); // Refresh data
      onClose();
    } catch (error) {
      toast.error("Gagal memperbarui order");
      setMsg(error?.response?.data?.message || "Gagal memperbarui order");
    } finally {
      setLoading(false);
    }
  };
  if (!open) return null;

  return (
    <Modal
      icon={<FaBook className="text-blue-500" />}
      title="Edit Order"
      onClose={onClose}
      closeOnOverlayClick={false}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-sm">
        {/* Paket */}
        <Label text="Paket">
          <Select
            options={paketData.map((paket) => ({
              value: paket.id,
              label: (
                <div className="flex flex-col">
                  <div className="font-semibold">
                    {paket.name} • {paket.level}
                  </div>
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
          />
        </Label>

        <div className="grid grid-cols-2 gap-4">
          {/* Tentor */}
          <Label text="Tentor">
            <Select
              options={tentorData.map((tentor) => ({
                value: tentor.id,
                label: (
                  <div className="flex flex-row items-center">
                    <img
                      src={tentor.fotoUrl || "/images/default-avatar.png"}
                      alt={tentor.name}
                      className="w-8 h-8 rounded-full mr-2"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/images/default-avatar.png";
                      }}
                    />
                    <div className="flex flex-col">
                      <div className="font-semibold text-xs text-left">
                        {tentor.name}
                      </div>
                      <div className="font-medium text-xs text-left">
                        {tentor.id}
                      </div>
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
        </div>

        {/* Message and buttons */}
        {msg && <span className="text-red-600 text-sm">{msg}</span>}
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
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// Helper components and functions
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
