import { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import Modal from '@/app/component/modal';
import { FaCheckCircle, FaExclamationTriangle, FaEdit } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Select from 'react-select';

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export default function ApproveModal({ 
  open, 
  onClose, 
  orderId, 
  onSuccess 
}) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [order, setOrder] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [edits, setEdits] = useState({
    tentorId: null,
    meetingDay: [],
    time: '',
    mapel: []
  });
  const [tentorOptions, setTentorOptions] = useState([]);
  const [mapelOptions, setMapelOptions] = useState([]);

  useEffect(() => {
    if (!open || !orderId) return;

    const fetchData = async () => {
      try {
        const token = Cookies.get("token");
        
        // Fetch order data
        const orderResponse = await axios.get(`${API}/order/id/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrder(orderResponse.data);
        
        // Initialize edits with current order data
        setEdits({
          tentorId: orderResponse.data.tentorId,
          meetingDay: orderResponse.data.meetingDay || [],
          time: orderResponse.data.time || '',
          mapel: orderResponse.data.mapel?.map(m => m.id) || []
        });

        // Fetch tentor options
        const tentorResponse = await axios.get(`${API}/users/tentor`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTentorOptions(tentorResponse.data.map(t => ({
          value: t.id,
          label: `${t.name} (${t.id}) - ${t.level.join(', ')}`
        })));

        // Fetch mapel options
        const mapelResponse = await axios.get(`${API}/mapel`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMapelOptions(mapelResponse.data.map(m => ({
          value: m.id,
          label: m.name
        })));

      } catch (error) {
        toast.error("Gagal memuat data");
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [open, orderId]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleEditChange = (field, value) => {
    setEdits(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleConfirm = async () => {
    try {
      setLoading(true);
      setMessage('');
      
      const token = Cookies.get("token");
      const endpoint = `order/approve/${orderId}`;

      const payload = isEditing 
        ? {
            tentorId: edits.tentorId,
            meetingDay: edits.meetingDay,
            time: edits.time,
            mapel: edits.mapel
          }
        : {};

      await axios.put(
        `${API}/${endpoint}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      onSuccess();
      onClose();
    } catch (error) {
      setMessage(error.response?.data?.message || "Gagal memproses persetujuan");
      toast.error("Persetujuan gagal");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      icon={<FaCheckCircle className='text-green-500' />}
      title="Konfirmasi Persetujuan"
      size="lg"
    >
      {loading ? (
        <div className="text-center py-4">Memproses...</div>
      ) : message ? (
        <div className="text-red-600 text-center py-4">{message}</div>
      ) : (
        <div className="flex flex-col gap-6 text-sm">
          <div className="text-center">
            <FaExclamationTriangle className="text-4xl text-green-500 mx-auto mb-3" />
            <p className="text-gray-600">
              Apakah Anda yakin ingin menyetujui paket ini?
            </p>
            
            <button
              onClick={handleEditToggle}
              className={`mt-2 flex items-center gap-2 text-sm ${
                isEditing ? 'text-green-600' : 'text-blue-600'
              }`}
            >
              <FaEdit />
              {isEditing ? 'Sembunyikan Edit' : 'Edit Detail Order'}
            </button>
          </div>

          {isEditing ? (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="grid grid-cols-1 gap-4">
                {/* Tentor Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tentor
                  </label>
                  <Select
                    options={tentorOptions}
                    value={tentorOptions.find(opt => opt.value === edits.tentorId)}
                    onChange={(selected) => handleEditChange('tentorId', selected.value)}
                    className="basic-single"
                    classNamePrefix="select"
                    placeholder="Pilih Tentor..."
                    noOptionsMessage={() => "Tidak ada tentor tersedia"}
                  />
                </div>

                {/* Meeting Days */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hari Pertemuan
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map(day => (
                      <label key={day} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={edits.meetingDay.includes(day)}
                          onChange={(e) => {
                            const newDays = e.target.checked
                              ? [...edits.meetingDay, day]
                              : edits.meetingDay.filter(d => d !== day);
                            handleEditChange('meetingDay', newDays);
                          }}
                          className="mr-2"
                        />
                        {day}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Waktu
                  </label>
                  <input
                    type="time"
                    value={edits.time}
                    onChange={(e) => handleEditChange('time', e.target.value)}
                    className="border rounded p-2 w-full"
                  />
                </div>

                {/* Subjects */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mata Pelajaran
                  </label>
                  <Select
                    isMulti
                    options={mapelOptions}
                    value={mapelOptions.filter(opt => edits.mapel.includes(opt.value))}
                    onChange={(selected) => handleEditChange('mapel', selected.map(opt => opt.value))}
                    className="basic-multi-select"
                    classNamePrefix="select"
                    placeholder="Pilih Mata Pelajaran..."
                    noOptionsMessage={() => "Tidak ada mata pelajaran tersedia"}
                  />
                </div>
              </div>
            </div>
          ) : order && (
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="grid grid-cols-1 gap-2 text-sm">
                {/* Siswa */}
                <div className="flex justify-between">
                  <span className="text-green-600">Siswa:</span>
                  <span className="text-green-700 font-medium">
                    {order.siswa?.name} ({order.siswa?.id})
                  </span>
                </div>

                {/* Tentor */}
                <div className="flex justify-between">
                  <span className="text-green-600">Tentor:</span>
                  <span className="text-green-700 font-medium">
                    {order.tentor?.name} ({order.tentor?.id})
                  </span>
                </div>

                {/* Paket */}
                <div className="flex justify-between">
                  <span className="text-green-600">Paket:</span>
                  <span className="text-green-700 font-medium">
                    {order.paket?.name}
                  </span>
                </div>

                {/* Jadwal */}
                <div className="flex justify-between">
                  <span className="text-green-600">Jadwal:</span>
                  <span className="text-green-700 font-medium">
                    {order.meetingDay?.join(', ')} {order.time?.slice(0, 5)}
                  </span>
                </div>

                {/* Mata Pelajaran */}
                <div className="flex justify-between">
                  <span className="text-green-600">Mapel:</span>
                  <span className="text-green-700 font-medium">
                    {order.mapel?.map(m => m.name).join(', ')}
                  </span>
                </div>

                {/* Tanggal */}
                <div className="flex justify-between">
                  <span className="text-green-600">Dibuat:</span>
                  <span className="text-green-700 font-medium">
                    {new Date(order.createdAt).toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-green-600">Terakhir Update:</span>
                  <span className="text-green-700 font-medium">
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
              className="px-4 py-2 rounded-lg text-white flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50"
            >
              <FaCheckCircle />
              {loading ? 'Memproses...' : 'Setujui'}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}