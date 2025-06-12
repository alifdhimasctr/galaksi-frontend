import { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import Modal from '@/app/component/modal';
import { FaTimesCircle, FaExclamationTriangle } from 'react-icons/fa';
import toast from 'react-hot-toast';

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export default function RejectModal({ 
  open, 
  onClose, 
  orderId, 
  onSuccess 
}) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (!open || !orderId) return;

    const fetchOrder = async () => {
      try {
        const token = Cookies.get("token");
        const response = await axios.get(`${API}/order/id/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrder(response.data);
      } catch (error) {
        toast.error("Gagal memuat data order");
        console.error("Error fetching order:", error);
      }
    };

    fetchOrder();
  }, [open, orderId]);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      setMessage('');
      
      const token = Cookies.get("token");
      await axios.put(
        `${API}/order/reject/${orderId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      onSuccess();
      onClose();
    } catch (error) {
      setMessage(error.response?.data?.message || "Gagal memproses penolakan");
      toast.error("Penolakan gagal");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      icon={<FaTimesCircle className='text-red-500' />}
      title="Konfirmasi Penolakan"
      size="lg"
    >
      {loading ? (
        <div className="text-center py-4">Memproses...</div>
      ) : message ? (
        <div className="text-red-600 text-center py-4">{message}</div>
      ) : (
        <div className="flex flex-col gap-6 text-sm">
          <div className="text-center">
            <FaExclamationTriangle className="text-4xl text-red-500 mx-auto mb-3" />
            <p className="text-gray-600">
              Apakah Anda yakin ingin menolak paket ini?
            </p>
          </div>

          {order && (
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-red-600">Siswa:</span>
                  <span className="text-red-700 font-medium">
                    {order.siswa?.name} ({order.siswa?.id})
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-red-600">Tentor:</span>
                  <span className="text-red-700 font-medium">
                    {order.tentor?.name} ({order.tentor?.id})
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-red-600">Paket:</span>
                  <span className="text-red-700 font-medium">
                    {order.paket?.name}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-red-600">Jadwal:</span>
                  <span className="text-red-700 font-medium">
                    {order.meetingDay?.join(', ')} {order.time?.slice(0, 5)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-red-600">Mapel:</span>
                  <span className="text-red-700 font-medium">
                    {order.mapel?.map(m => m.name).join(', ')}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-red-600">Dibuat:</span>
                  <span className="text-red-700 font-medium">
                    {new Date(order.createdAt).toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-red-600">Terakhir Update:</span>
                  <span className="text-red-700 font-medium">
                    {new Date(order.updatedAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-lg border bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="px-4 py-2 rounded-lg text-white flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50"
            >
              <FaTimesCircle />
              {loading ? 'Memproses...' : 'Tolak'}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}