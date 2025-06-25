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
} from "react-icons/fa";
import axios from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import Modal from "@/app/component/modal";
import Select from "react-select";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export default function EditTentorModal({
  open,
  onClose,
  onSuccess,
  tentorId,
}) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [mapelOptions, setMapelOptions] = useState([]);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [simPreview, setSimPreview] = useState(null);
  const [ktpPreview, setKtpPreview] = useState(null);
  const [cvPreview, setCvPreview] = useState(null);

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

    const fetchData = async () => {
  try {
    const token = Cookies.get("token");
    
    // Fetch tentor data
    const { data: tentorData } = await axios.get(`${API}/users/tentor/${tentorId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Fetch mapel options
    const { data: mapelData } = await axios.get(`${API}/mapel`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const mapelOptions = mapelData.map((item) => ({
      value: item.id,
      label: item.name,
    }));

    setMapelOptions(mapelOptions);

    // Cari ID mapel berdasarkan nama mapel yang ada di tentorData.mapel
    const tentorMapelIds = tentorData.mapel
      ? tentorData.mapel.map(mapelName => {
          const found = mapelData.find(m => m.name === mapelName);
          return found ? found.id : null;
        }).filter(id => id !== null)
      : [];

    // Set form data
    setForm({
      ...tentorData,
      status: tentorData.status || "active",
      level: tentorData.level || [],
      mapel: tentorMapelIds, // Gunakan ID mapel yang sudah dicari
    });

    // Set previews untuk existing files
    if (tentorData.fotoUrl) setFotoPreview(tentorData.fotoUrl);
    if (tentorData.simUrl) setSimPreview(tentorData.simUrl);
    if (tentorData.ktpUrl) setKtpPreview(tentorData.ktpUrl);
    if (tentorData.cvUrl) setCvPreview(tentorData.cvUrl);

  } catch (err) {
    toast.error("Gagal memuat data");
    setMsg(err?.response?.data?.message || "Gagal memuat data");
  }
};

    fetchData();
  }, [open, tentorId]);

  const change = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleFileChange = (field) => (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm({ ...form, [field]: file });
    const reader = new FileReader();
    reader.onloadend = () => {
      const previewSetter = {
        foto: setFotoPreview,
        sim: (res) =>
          setSimPreview(file.type === "application/pdf" ? "pdf" : res),
        ktp: (res) =>
          setKtpPreview(file.type === "application/pdf" ? "pdf" : res),
        cv: (res) =>
          setCvPreview(file.type === "application/pdf" ? "pdf" : res),
      }[field];
      previewSetter(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleMapelChange = (selectedOptions) => {
    setForm((prev) => ({
      ...prev,
      mapel: selectedOptions ? selectedOptions.map((opt) => opt.value) : [],
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setMsg("");
  if (!form.email || !form.name || form.level.length === 0) {
    return setMsg("Email, Nama, dan Jenjang harus diisi");
  }
  try {
    setLoading(true);
    const token = Cookies.get("token");
    const formData = new FormData();

    // Append all fields except 'ktpUrl', 'fotoUrl', 'simUrl', and 'cvUrl'
    Object.keys(form).forEach((key) => {
      if (
        key === "level" ||
        key === "mapel"
      ) {
        formData.append(key, JSON.stringify(form[key]));
      } else if (
        !["ktpUrl", "fotoUrl", "simUrl", "cvUrl"].includes(key) &&
        form[key] !== null &&
        form[key] !== undefined
      ) {
        formData.append(key, form[key]);
      }
    });

    await axios.put(`${API}/tentor/${tentorId}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    setLoading(false);
    onSuccess();
    toast.success("Tentor berhasil diperbarui");
    onClose();
  } catch (err) {
    setLoading(false);
    toast.error("Gagal memperbarui tentor");
    setMsg(err?.response?.data?.message || "Gagal memperbarui tentor");
  }
};



  const statusOptions = [
    { value: "active", label: "Aktif" },
    { value: "nonactive", label: "Nonaktif" },
  ];

  const genderOptions = [
    { value: "L", label: "Laki-Laki" },
    { value: "P", label: "Perempuan" },
  ];

  const levelOptions = [
    { value: "TK", label: "TK" },
    { value: "SD", label: "SD" },
    { value: "SMP", label: "SMP" },
    { value: "SMA", label: "SMA" },
  ];

  useEffect(() => {
    if (!open) {
      setFotoPreview(null);
      setSimPreview(null);
      setKtpPreview(null);
      setCvPreview(null);
    }
  }, [open]);

  const handleSelectChange = (field) => (selectedOption) => {
    setForm((prev) => ({
      ...prev,
      [field]: selectedOption ? selectedOption.value : "",
    }));
  };

  const handleMultiSelectChange = (selectedOptions) => {
    setForm((prev) => ({
      ...prev,
      level: selectedOptions.map((opt) => opt.value),
    }));
  };

  const selectStyles = {
    control: (base) => ({
      ...base,
      minHeight: "44px",
      borderColor: "#e5e7eb",
      "&:hover": { borderColor: "#3b82f6" },
      "&:focus-within": {
        borderColor: "#3b82f6",
        boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.1)",
      },
    }),
    indicatorSeparator: () => ({ display: "none" }),
    dropdownIndicator: (base) => ({
      ...base,
      color: "#6b7280",
      padding: "0 12px",
    }),
  };

  if (!open) return null;
  return (
    <Modal
      icon={<FaUser className="text-blue-500" />}
      title="Edit Tentor"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Label text="Status">
            <Select
              options={statusOptions}
              styles={selectStyles}
              value={statusOptions.find((opt) => opt.value === form.status)}
              onChange={handleSelectChange("status")}
            />
          </Label>
          <Label text="ID Tentor">
            <Input value={tentorId} icon={<FaUser />} disabled />
          </Label>
          <Label text="Email">
            <Input
              type="email"
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
          <Label text="No. HP">
            <Input
              icon={<FaPhone />}
              value={form.noHp}
              onChange={change("noHp")}
            />
          </Label>
          <Label text="Gender">
            <Select
              options={genderOptions}
              styles={selectStyles}
              value={genderOptions.find((opt) => opt.value === form.gender)}
              onChange={handleSelectChange("gender")}
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
            value={levelOptions.filter((opt) => form.level.includes(opt.value))}
          />
        </Label>

        <Label text="Mapel yang Diajarkan">
          <Select
            isMulti
            options={mapelOptions}
            styles={selectStyles}
            placeholder="Pilih Mapel"
            onChange={handleMapelChange}
            value={mapelOptions.filter(
              (opt) =>
                Array.isArray(form.mapel) && form.mapel.includes(opt.value)
            )}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Label text="Foto">
            <FileInput
              onChange={handleFileChange("foto")}
              acceptedFiles="image/*"
              preview={fotoPreview}
              onRemove={() => {
                setForm((prev) => ({ ...prev, foto: null }));
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
                setForm((prev) => ({ ...prev, sim: null }));
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
                setForm((prev) => ({ ...prev, ktp: null }));
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
                setForm((prev) => ({ ...prev, cv: null }));
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
            ) : (
              "Simpan Perubahan"
            )}
          </button>
        </div>
      </form>
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
        {preview === "pdf" ||
        (typeof preview === "string" && preview.endsWith(".pdf")) ? (
          <div className="flex flex-col items-center justify-center h-full text-blue-500">
            <FaFilePdf className="text-3xl" />
            <span className="text-sm mt-2">PDF File</span>
          </div>
        ) : (
          <>
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={onRemove}
              className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm hover:bg-gray-100 transition-colors"
            >
              <FaTimes className="text-red-500 text-sm" />
            </button>
          </>
        )}
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
    <span className="flex items-center gap-2 font-medium text-gray-700">
      {text}
    </span>
    {children}
  </label>
);

const Input = ({ icon, type, value, onChange, className, disabled }) => (
  <div className="relative flex gap-2">
    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-800">
      {icon}
    </div>
    <input
      type={type}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`pl-10 p-2 w-full border border-gray-400 ${
        disabled ? "bg-gray-200" : "bg-white"
      } shadow-xs rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
      required
    />
  </div>
);
