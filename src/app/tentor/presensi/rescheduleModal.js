"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import Modal from "@/app/component/modal";
import { FaCalendarAlt, FaUserEdit } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export default function RescheduleModal({ open, onClose, jadwalId, refreshData }) {
  const [loading, setLoading] = useState(false);
  const [rescheduleType, setRescheduleType] = useState("date");
  const [newDate, setNewDate] = useState(null);
  const [newTime, setNewTime] = useState("");
  const [originalJadwal, setOriginalJadwal] = useState(null);

  // Fetch original schedule data
  useEffect(() => {
    const fetchOriginalJadwal = async () => {
      if (!open || !jadwalId) return;
      
      try {
        const token = Cookies.get("token");
        const response = await axios.get(`${API}/jadwal/id/${jadwalId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        const jadwal = response.data;
        setOriginalJadwal(jadwal);
        
        // Set initial values from original data
        if (jadwal.date) {
          const [year, month, day] = jadwal.date.split('-');
          setNewDate(new Date(year, month - 1, day));
        }
        if (jadwal.time) {
          setNewTime(jadwal.time.substring(0, 5)); // Extract HH:mm from time string
        }
      } catch (error) {
        toast.error("Gagal memuat data jadwal");
      }
    };

    fetchOriginalJadwal();
  }, [open, jadwalId]);

  const handleReschedule = async () => {
    try {
      setLoading(true);
      const token = Cookies.get("token");
  
      if (rescheduleType === "date") {
        // Format tanggal secara manual untuk menghindari masalah timezone
        const year = newDate.getFullYear();
        const month = String(newDate.getMonth() + 1).padStart(2, '0');
        const day = String(newDate.getDate()).padStart(2, '0');
        
        const payload = {
          newDate: `${year}-${month}-${day}`,
          newTime: newTime + ":00"
        };
  
        await axios.put(`${API}/jadwal/reschedule/date/${jadwalId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.put(`${API}/jadwal/reschedule/tentor/${jadwalId}`, null, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
  
      toast.success("Reschedule berhasil diajukan");
      refreshData();
      onClose();
    } catch (error) {
      toast.error("Gagal mengajukan reschedule");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <Modal
      icon={rescheduleType === "date" ? <FaCalendarAlt className="text-blue-500" /> : <FaUserEdit className="text-orange-500" />}
      title={`Ajukan Reschedule - ${rescheduleType === "date" ? "Jadwal" : "Tentor"}`}
      onClose={onClose}
    >
      <div className="space-y-4">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setRescheduleType("date")}
            className={`px-4 py-2 rounded ${
              rescheduleType === "date" 
                ? "bg-blue-500 text-white" 
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            Reschedule Jadwal
          </button>
          <button
            onClick={() => setRescheduleType("tentor")}
            className={`px-4 py-2 rounded ${
              rescheduleType === "tentor" 
                ? "bg-orange-500 text-white" 
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            Ganti Tentor
          </button>
        </div>

        {rescheduleType === "date" ? (
          originalJadwal ? (
            <>
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Tanggal Baru (Sebelumnya: {originalJadwal.date})
                </label>
                <DatePicker
                  selected={newDate}
                  onChange={(date) => setNewDate(date)}
                  minDate={new Date()}
                  className="p-2 border rounded w-full"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Waktu Baru (Sebelumnya: {originalJadwal.time.substring(0, 5)})
                </label>
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="p-2 border rounded w-full"
                />
              </div>
            </>
          ) : (
            <p>Memuat data jadwal...</p>
          )
        ) : (
          <p className="text-sm text-gray-600">
            Permintaan ganti tentor akan diteruskan ke admin
          </p>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border bg-gray-100 hover:bg-gray-200"
          >
            Batal
          </button>
          <button
            onClick={handleReschedule}
            disabled={loading || !originalJadwal}
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60"
          >
            {loading ? "Mengajukan..." : "Ajukan Reschedule"}
          </button>
        </div>
      </div>
    </Modal>
  );
}