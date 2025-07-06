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
  FaUniversity,
  FaMoneyBill,
  FaSchool,
  FaUpload,
  FaFilePdf,
  FaCalendarAlt,
  FaClock,
  FaTrash,
  FaPlus
} from "react-icons/fa";
import axios from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import Modal from "@/app/component/modal";
import Select from 'react-select';
import TimePicker from 'react-time-picker';
import 'react-time-picker/dist/TimePicker.css';
import 'react-clock/dist/Clock.css';

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export default function AddTentorModal({ open, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [mapelOptions, setMapelOptions] = useState([]);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [simPreview, setSimPreview] = useState(null);
  const [ktpPreview, setKtpPreview] = useState(null);
  const [cvPreview, setCvPreview] = useState(null);
  const [schedule, setSchedule] = useState([]);

  const [form, setForm] = useState({
    status: "active",
    email: "",
    name: "",
    noHp: "",
    gender: "",
    faculty: "",
    university: "",
    city: "",
    address: "",
    wallet: 0,
    level: [],
    mapel: [],
    foto: null,
    sim: null,
    ktp: null,
    cv: null,
    bankName: "",
    bankNumber: "",
  });

  useEffect(() => {
    if (!open) return;  
    const fetchMapel = async () => {
      try {
        const token = Cookies.get("token");
        const { data } = await axios.get(`${API}/mapel`, {  
          headers: { Authorization: `Bearer ${token}` },
        });
        const options = data.map((item) => ({
          value: item.id,
          label: item.name, 
        }));
        setMapelOptions(options);
      } catch (err) {
        toast.error("Gagal memuat data mapel");
        setMsg(err?.response?.data?.message || "Gagal memuat data mapel");
      }
    }
    fetchMapel();
  }, [open]);

  // Initialize schedule when modal opens
  useEffect(() => {
    if (open) {
      setSchedule([
        { day: "Senin", slots: [] },
        { day: "Selasa", slots: [] },
        { day: "Rabu", slots: [] },
        { day: "Kamis", slots: [] },
        { day: "Jumat", slots: [] },
        { day: "Sabtu", slots: [] },
        { day: "Minggu", slots: [] },
      ]);
    }
  }, [open]);

  const change = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleFileChange = (field) => (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm({ ...form, [field]: file });
    const reader = new FileReader();
    reader.onloadend = () => {
      const previewSetter = {
        foto: setFotoPreview,
        sim: (res) => setSimPreview(file.type === "application/pdf" ? "pdf" : res),
        ktp: (res) => setKtpPreview(file.type === "application/pdf" ? "pdf" : res),
        cv: (res) => setCvPreview(file.type === "application/pdf" ? "pdf" : res),
      }[field];
      previewSetter(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleMapelChange = (selectedOptions) => {
    setForm(prev => ({
      ...prev,
      mapel: selectedOptions ? selectedOptions.map(opt => opt.value) : []
    }));
  };

  // SCHEDULE HANDLERS
  const addTimeSlot = (dayIndex) => {
    const newSchedule = [...schedule];
    newSchedule[dayIndex].slots.push({ start: "08:00", end: "10:00" });
    setSchedule(newSchedule);
  };

  const removeTimeSlot = (dayIndex, slotIndex) => {
    const newSchedule = [...schedule];
    newSchedule[dayIndex].slots.splice(slotIndex, 1);
    setSchedule(newSchedule);
  };

  const updateTimeSlot = (dayIndex, slotIndex, field, value) => {
    const newSchedule = [...schedule];
    newSchedule[dayIndex].slots[slotIndex][field] = value;
    setSchedule(newSchedule);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    
    // Validate required fields
    if (!form.email || !form.name || form.level.length === 0) {
      return setMsg("Email, Nama, dan Jenjang harus diisi");
    }
    
    // Validate schedule
    const hasSchedule = schedule.some(day => day.slots.length > 0);
    if (!hasSchedule) {
      return setMsg("Harap tambahkan setidaknya satu jadwal");
    }
    
    // Validate each time slot
    for (const day of schedule) {
      for (const slot of day.slots) {
        if (!slot.start || !slot.end) {
          return setMsg("Waktu mulai dan selesai harus diisi");
        }
        
        // Convert time to minutes for comparison
        const startMinutes = parseInt(slot.start.split(':')[0]) * 60 + parseInt(slot.start.split(':')[1]);
        const endMinutes = parseInt(slot.end.split(':')[0]) * 60 + parseInt(slot.end.split(':')[1]);
        
        if (startMinutes >= endMinutes) {
          return setMsg("Waktu mulai harus sebelum waktu selesai");
        }
      }
    }

    try {
      setLoading(true);
      const token = Cookies.get("token");
      const formData = new FormData();
      
      // Append form fields
      formData.append("name", form.name);
      formData.append("email", form.email);
      formData.append("noHp", form.noHp);
      formData.append("gender", form.gender);
      formData.append("faculty", form.faculty);
      formData.append("university", form.university);
      formData.append("city", form.city);
      formData.append("address", form.address);
      formData.append("wallet", form.wallet);
      formData.append("level", JSON.stringify(form.level));
      formData.append("mapel", JSON.stringify(form.mapel));
      formData.append("foto", form.foto);
      formData.append("sim", form.sim);
      formData.append("ktp", form.ktp);
      formData.append("cv", form.cv);
      formData.append("bankName", form.bankName);
      formData.append("bankNumber", form.bankNumber);
      
      // Prepare and append schedule in the new format
      const formattedSchedule = schedule
        .filter(day => day.slots.length > 0)
        .map(day => ({
          day: day.day,
          slots: day.slots.map(slot => `${slot.start}-${slot.end}`)
        }));
      
      formData.append("schedule", JSON.stringify(formattedSchedule));

      await axios.post(`${API}/register/tentor`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setLoading(false);
      onSuccess();
      toast.success("Tentor berhasil ditambahkan");
      onClose();
    } catch (err) {
      setLoading(false);
      toast.error("Gagal menambah tentor");
      setMsg(err?.response?.data?.message || "Gagal menambah tentor");
    }
  };

  const genderOptions = [
    { value: 'L', label: 'Laki-Laki' },
    { value: 'P', label: 'Perempuan' }
  ];

  const levelOptions = [
    { value: 'TK', label: 'TK' },
    { value: 'SD', label: 'SD' },
    { value: 'SMP', label: 'SMP' },
    { value: 'SMA', label: 'SMA' }
  ];

  useEffect(() => {
    if (!open) {
      setFotoPreview(null);
      setSimPreview(null);
      setKtpPreview(null);
      setCvPreview(null);
      setSchedule([]);
    }
  }, [open]);

  const handleSelectChange = (field) => (selectedOption) => {
    setForm(prev => ({ ...prev, [field]: selectedOption ? selectedOption.value : '' }));
  };

  const handleMultiSelectChange = (selectedOptions) => {
    setForm(prev => ({
      ...prev,
      level: selectedOptions.map(opt => opt.value)
    }));
  };

  const selectStyles = {
    control: (base) => ({
      ...base,
      minHeight: '44px',
      borderColor: '#e5e7eb',
      '&:hover': { borderColor: '#3b82f6' },
      '&:focus-within': {
        borderColor: '#3b82f6',
        boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.1)'
      }
    }),
    indicatorSeparator: () => ({ display: 'none' }),
    dropdownIndicator: (base) => ({
      ...base,
      color: '#6b7280',
      padding: '0 12px'
    })
  };

  if (!open) return null;
  return (
    <Modal icon={<FaUser className="text-blue-500" />} title="Tambah Tentor" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Label text="Email">
            <Input
              type="email"
              icon={<FaEnvelope />}
              value={form.email}
              onChange={change("email")}
            />
          </Label>
          <Label text="Nama Lengkap">
            <Input icon={<FaUser />} value={form.name} onChange={change("name")} />
          </Label>
          <Label text="No. HP">
            <Input icon={<FaPhone />} value={form.noHp} onChange={change("noHp")} />
          </Label>
          <Label text="Gender">
            <Select
              options={genderOptions}
              styles={selectStyles}
              placeholder="Pilih Gender"
              onChange={handleSelectChange('gender')}
            />
          </Label>
          <Label text="Fakultas">
            <Input
              icon={<FaUniversity />}
              value={form.faculty}
              onChange={change("faculty")}
            />
          </Label>
          <Label text="Universitas">
            <Input
              icon={<FaSchool />}
              value={form.university}
              onChange={change("university")}
            />
          </Label>
          <Label text="Kota">
            <Input icon={<FaCity />} value={form.city} onChange={change("city")} />
          </Label>
        </div>

        <Label text="Alamat">
          <textarea
            value={form.address}
            onChange={change("address")}
            className="p-3 h-24 w-full border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </Label>

        <Label text="Jenjang (Pilih lebih dari satu)">
          <Select
            isMulti
            options={levelOptions}
            styles={selectStyles}
            placeholder="Pilih Jenjang"
            onChange={handleMultiSelectChange}
            value={levelOptions.filter(opt => form.level.includes(opt.value))}
          />
        </Label>

        <Label text="Mapel yang Diajarkan">
          <Select
            isMulti
            options={mapelOptions}
            styles={selectStyles}
            placeholder="Pilih Mapel"
            onChange={handleMapelChange}
            value={mapelOptions.filter(opt => form.mapel.includes(opt.value))}
            closeMenuOnSelect={false}
          />
        </Label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Label text="Nama Bank">
            <Input
              icon={<FaMoneyBill />}
              value={form.bankName}
              onChange={change("bankName")}
            />
          </Label>
          <Label text="Nomor Rekening">
            <Input value={form.bankNumber} onChange={change("bankNumber")} />
          </Label>
        </div>

        {/* SCHEDULE SECTION */}
        <div className="mt-4">
          <h3 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
            <FaCalendarAlt className="text-blue-500" /> Jadwal Tersedia
          </h3>
          <p className="text-sm text-gray-500 mb-3">Tambahkan waktu yang tersedia untuk mengajar</p>
          
          <div className="space-y-4">
            {schedule.map((day, dayIndex) => (
              <div key={day.day} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <FaClock className="text-blue-500" /> {day.day}
                  </h4>
                  <button
                    type="button"
                    onClick={() => addTimeSlot(dayIndex)}
                    className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm flex items-center gap-1"
                  >
                    <FaPlus className="text-xs" /> Tambah Waktu
                  </button>
                </div>
                
                {day.slots.length === 0 ? (
                  <p className="text-gray-500 text-sm italic">Belum ada waktu tersedia</p>
                ) : (
                  <div className="space-y-3">
                    {day.slots.map((slot, slotIndex) => (
                      <div key={slotIndex} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-gray-50 rounded-md">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-gray-700 w-20">Mulai:</span>
                          <TimePicker
                            onChange={(value) => updateTimeSlot(dayIndex, slotIndex, 'start', value)}
                            value={slot.start}
                            disableClock={true}
                            className="time-picker"
                          />
                        </div>
                        
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-gray-700 w-20">Selesai:</span>
                          <TimePicker
                            onChange={(value) => updateTimeSlot(dayIndex, slotIndex, 'end', value)}
                            value={slot.end}
                            disableClock={true}
                            className="time-picker"
                          />
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => removeTimeSlot(dayIndex, slotIndex)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-full self-end sm:self-auto"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Label text="Foto">
            <FileInput
              onChange={handleFileChange("foto")}
              acceptedFiles="image/*"
              preview={fotoPreview}
              onRemove={() => {
                setForm(prev => ({ ...prev, foto: null }));
                setFotoPreview(null);
              }}
            />
          </Label>
          <Label text="SIM">
            <FileInput
              onChange={handleFileChange("sim")}
              acceptedFiles="application/pdf,image/*"
              preview={simPreview}
              onRemove={() => {
                setForm(prev => ({ ...prev, sim: null }));
                setSimPreview(null);
              }}
            />
          </Label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Label text="KTP">
            <FileInput
              onChange={handleFileChange("ktp")}
              acceptedFiles="application/pdf,image/*"
              preview={ktpPreview}
              onRemove={() => {
                setForm(prev => ({ ...prev, ktp: null }));
                setKtpPreview(null);
              }}
            />
          </Label>
          <Label text="CV">
            <FileInput
              onChange={handleFileChange("cv")}
              acceptedFiles="application/pdf,image/*"
              preview={cvPreview}
              onRemove={() => {
                setForm(prev => ({ ...prev, cv: null }));
                setCvPreview(null);
              }}
            />
          </Label>
        </div>

        {msg && (
          <div className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-100">
            {msg}
          </div>
        )}

        <div className="flex justify-end gap-3 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400 flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Menyimpan...
              </>
            ) : 'Simpan'}
          </button>
        </div>
      </form>
      
      <style jsx global>{`
        .time-picker {
          width: 100%;
        }
        .time-picker .react-time-picker__wrapper {
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          padding: 0.5rem;
          background: white;
        }
        .time-picker .react-time-picker__inputGroup {
          min-width: 70px;
        }
        .time-picker .react-time-picker__inputGroup__input {
          color: #4b5563;
        }
        .time-picker .react-time-picker__button {
          padding: 0 0.5rem;
        }
        .time-picker .react-time-picker__button svg {
          width: 1rem;
          height: 1rem;
        }
      `}</style>
    </Modal>
  );
}

const FileInput = ({ onChange, acceptedFiles, preview, onRemove }) => (
  <div className="relative border border-gray-200 rounded-lg p-2 hover:border-blue-500 transition-colors group">
    <input
      type="file"
      onChange={onChange}
      accept={acceptedFiles}
      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
    />
    {preview ? (
      <div className="relative h-32">
        {preview === 'pdf' ? (
          <div className="flex flex-col items-center justify-center h-full text-blue-500">
            <FaFilePdf className="text-3xl" />
            <span className="text-sm mt-2">PDF File</span>
          </div>
        ) : (
          <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
        )}
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm hover:bg-gray-100 transition-colors"
        >
          <FaTimes className="text-red-500 text-sm" />
        </button>
      </div>
    ) : (
      <div className="flex items-center justify-center gap-2 p-3 text-gray-500 h-32">
        <FaUpload className="text-sm" />
        <span className="text-sm">Upload File</span>
      </div>
    )}
  </div>
);

const Label = ({ text, children, className = "" }) => (
  <label className={`flex flex-col gap-1 ${className}`}>
    <span className="flex items-center gap-2 font-medium text-gray-700">{text}</span>
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
      required
    />
  </div>
);