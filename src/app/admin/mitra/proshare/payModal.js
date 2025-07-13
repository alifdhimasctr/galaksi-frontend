import Modal from '@/app/component/modal'
import React, { useEffect, useState } from 'react'
import { FaMoneyBill, FaUpload, FaTimes } from 'react-icons/fa'
import axios from 'axios'
import Cookies from 'js-cookie'
import toast from 'react-hot-toast'

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export default function PayModal({ open, onClose, onSuccess, proshareId }) {
    const [loading, setLoading] = useState(false)
    const [msg, setMsg] = useState("")
    const [preview, setPreview] = useState(null);
    const [form, setForm] = useState({ transferProof: "" })
    const [proshare, setProshare] = useState(null);

    useEffect(() => {
        if (open && proshareId) {
            const fetchProshare = async () => {
                try {
                    const token = Cookies.get("token");
                    const { data } = await axios.get(`${API}/proshare/id/${proshareId}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    setProshare(data);
                    setForm({ transferProof: "" });
                    setPreview(null);
                } catch (error) {
                    setMsg(error.response?.data?.message || "Terjadi kesalahan saat mengambil data proshare");
                    toast.error("Gagal mengambil data proshare!");
                }
            };
            fetchProshare();
        } else {
            setProshare(null);
            setForm({ transferProof: "" });
            setPreview(null);
        }
    }, [open, proshareId]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.transferProof) return setMsg("Harap upload bukti transfer");
        
        setLoading(true);
        setMsg("");

        const formData = new FormData();
        formData.append("transferProof", form.transferProof);

        try {
            const token = Cookies.get("token");
            await axios.put(`${API}/proshare/payment/${proshareId}`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });
            
            toast.success("Pembayaran proshare berhasil!");
            onSuccess();
            onClose();
        } catch (error) {
            setMsg(error.response?.data?.message || "Terjadi kesalahan");
            toast.error("Pembayaran gagal!");
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setForm({ ...form, transferProof: file });
            setPreview(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setForm({ ...form, transferProof: "" });
        setPreview(null);
        URL.revokeObjectURL(preview);
    };

    if (!open) return null;

    return (
        <Modal
            icon={<FaMoneyBill className='text-green-500'/>}
            title="Konfirmasi Pembayaran Proshare"
            onClose={onClose}
        >
            {/* tampilkan nama bank dan nomor rekening mitra */}
             {proshare && (
                <div className="mb-4">
                    <p className="text-sm text-gray-700 mb-1">
                        Silakan transfer ke rekening berikut:
                    </p>
                    <p className="text-sm text-gray-700 mb-1">
                        {proshare.mitra.bankName} - {proshare.mitra.bankNumber}
                    </p>
                </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
                {msg && (
                    <div className="p-3 bg-red-100 text-red-700 rounded-lg flex items-center gap-2">
                        <FaTimes className="flex-shrink-0" />
                        <span>{msg}</span>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload Bukti Transfer
                    </label>
                    
                    <div className="relative group">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                            id="fileInput"
                            disabled={loading}
                        />
                        
                        <label 
                            htmlFor="fileInput"
                            className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors group-hover:border-blue-500"
                        >
                            {preview ? (
                                <div className="relative w-full h-full">
                                    <img 
                                        src={preview} 
                                        alt="Preview" 
                                        className="w-full h-full object-cover rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm hover:bg-gray-100"
                                    >
                                        <FaTimes className="text-red-500" />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <FaUpload className="text-gray-400 text-xl mb-2" />
                                    <span className="text-sm text-gray-500">
                                        Klik untuk upload bukti transfer
                                    </span>
                                    <span className="text-xs text-gray-400 mt-1">
                                        Format: JPG, PNG (Maks. 5MB)
                                    </span>
                                </>
                            )}
                        </label>
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={loading || !form.transferProof}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Memproses...
                            </>
                        ) : (
                            <>
                                <FaMoneyBill />
                                Konfirmasi Pembayaran
                            </>
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    )
}