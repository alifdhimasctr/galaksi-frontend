"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import Modal from "@/app/component/modal";
import { FaUserTie, FaCheckCircle } from "react-icons/fa";
import Select from "react-select"

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export default function ApproveTentorModal({ open, onClose, onSuccess, jadwalId }) {
  const [tentors, setTentors] = useState([]);
  const [level, setLevel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({
    newTentorId: "",
  });

  useEffect(() => {
    if (!open) return;
    //get level from jadwal.siswa.level
    const fetchJadwal = async () => {
      try {
        const token = Cookies.get("token");
        const { data } = await axios.get(`${API}/jadwal/id/${jadwalId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if  (data?.siswa?.level) {
          setLevel(data.siswa.level);
        }
      } catch (e) {
        toast.error("Gagal memuat jadwal");
        console.error("Error fetching jadwal:", e);
      }
    };
    fetchJadwal();
    console .log("Fetching tentors for level:", level);
        
  }, [open]);

  useEffect(() => {
    if (!open || !level) return;
    const fetchTentors = async () => {
      try {
        const token = Cookies.get("token");
        const { data } = await axios.get(`${API}/tentor/level/${level}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTentors(data);
      } catch (e) {
        toast.error("Gagal memuat tentor");
        console.error("Error fetching tentors:", e);
      }
    };
    fetchTentors();
  }, [open, level]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
  
    const { newTentorId } = form;
    if (!newTentorId) return setMsg("Pilih tentor yang baru");

    try {
      setLoading(true);
      const token = Cookies.get("token");
  
        await axios.put(`${API}/jadwal/reschedule/tentor/approve/${jadwalId}`, { newTentorId }, {
            headers: { Authorization: `Bearer ${token}` },
        });
        setLoading(false);
        toast.success("Tentor berhasil disetujui");
        onSuccess(); // Refresh or reload table
        onClose(); // Close modal after success
    } catch (err) {
      setLoading(false);
    const errorMessage = err.response?.data?.message || "Gagal Memperbarui Jadwal";
    toast.error(errorMessage);
      // Jika error respons adalah error normal API yang diharapkan
    }
  };
  
  

  if (!open) return null;

  return (
    <Modal 
      icon={<FaCheckCircle className="text-green-500" />} 
      title="Setujui Tentor" 
      onClose={onClose}
    >
      <div className="flex flex-col gap-4 text-sm">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="text-center font-medium text-blue-700">
            Jadwal ID: {jadwalId}
          </div>
          <p className="text-center text-sm text-blue-600 mt-1">
            Silakan pilih tentor pengganti
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Pilih Tentor
            </label>
            <Select
              options={tentors.map(tentor => ({
                value: tentor.id,
                label: `${tentor.name} (${tentor.id})`,
              }))}
              onChange={(selectedOption) => {
                setForm({ ...form, newTentorId: selectedOption.value });
              }}
              className="basic-single"
              classNamePrefix="select"
              isClearable
              isSearchable
              placeholder="Pilih tentor..."
              styles={{
                control: (base) => ({
                  ...base,
                  borderColor: "gray",
                  boxShadow: "none",
                  "&:hover": {
                    borderColor: "blue",
                  },
                }),
              }}

            />
          </div>

          {msg && <div className="text-red-500 text-sm">{msg}</div>}

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700
                hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2.5 rounded-lg bg-green-600 text-white 
                hover:bg-green-700 disabled:bg-green-400 transition-colors
                flex items-center gap-2"
            >
              <FaCheckCircle />
              {loading ? "Memproses..." : "Setujui"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
