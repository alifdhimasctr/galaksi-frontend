/* ---------- AddMapelModal ---------- */
import React, { useState } from "react";
import { FaTag } from "react-icons/fa";
import axios from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import Modal from "@/app/component/modal";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export default function AddMapelModal({ open, onClose, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState("");
    const [form, setForm] = useState({ name: "" });

    const change = (key) => (e) => {
        setForm({ ...form, [key]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMsg("");

        if (!form.name) {
            return setMsg("Nama Mapel wajib diisi");
        }

        try {
            setLoading(true);
            const token = Cookies.get("token");
            await axios.post(`${API}/mapel`, form, {
                headers: { Authorization: `Bearer ${token}` },
            });
            onSuccess();
            toast.success("Mapel berhasil ditambahkan");
            onClose();
        } catch (err) {
            toast.error("Gagal menambah mapel");
            setMsg(err?.response?.data?.message || "Gagal menyimpan mapel");
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    return (
        <Modal
            icon={<FaTag className="text-blue-500" />}
            title="Tambah Mapel"
            onClose={onClose}
        >
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-sm">
                {/* Nama Mapel */}
                <Label text="Nama Mapel">
                    <Input
                        icon={<FaTag />}
                        value={form.name}
                        onChange={change("name")}
                        required
                    />
                </Label>

                {msg && <div className="text-red-600">{msg}</div>}

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
