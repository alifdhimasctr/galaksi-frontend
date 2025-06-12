"use client";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import DataTable from "@/app/component/DataTable";
import DashboardLayout from "@/app/component/dashboardLayout";
import { FaDownload, FaEye, FaFileDownload, FaMoneyBill } from "react-icons/fa";
import DetailModal from "./detailModal";


const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
const user = Cookies.get("user") ? JSON.parse(Cookies.get("user")) : null;

export default function HonorPage() {
  const [allHonors, setAllHonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [selectedHonor, setSelectedHonor] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        const token = Cookies.get("token");
        // Fetch data honor dan wallet secara paralel
        const [honorsRes, tentorRes] = await Promise.all([
          axios.get(`${API}/honor?tentorId=${user.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API}/users/tentor/${user.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        ]);
        // Proses data honor
        const processedHonors = honorsRes.data.map((honor) => ({
          ...honor,
          siswa: honor.siswa ? { id: honor.siswa.id, name: honor.siswa.name } : null,
          tentor: honor.tentor ? { id: honor.tentor.id, name: honor.tentor.name } : null,
        }));
        setAllHonors(processedHonors);

        // Set wallet balance dari response tentor
        if (tentorRes.data && tentorRes.data.wallet !== undefined) {
          setWalletBalance(tentorRes.data.wallet);
        }

      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Memisahkan data berdasarkan status pembayaran
  const { pendingHonors, paidHonors } = useMemo(() => {
    return {
      pendingHonors: allHonors.filter(h => h.paymentStatus === 'Pending'),
      paidHonors: allHonors.filter(h => h.paymentStatus === 'Paid')
    };
  }, [allHonors]);

  const columns = useMemo(() => {
    const baseColumns = [
      { accessorKey: "tentor.name", header: "Nama Tentor" },
      { accessorKey: "siswa.name", header: "Nama Siswa" },
      { 
        accessorKey: "total", 
        header: "Total Honor",
        cell: ({ row }) => (
          <span>
            Rp {parseInt(row.original.total).toLocaleString('id-ID')}
          </span>
        )
      },
      {accessorKey: "tentor.bankName", header: "Nama Bank"},
      {accessorKey: "tentor.bankNumber", header: "Nomor Rekening"}
    ];

    if(activeTab === 'paid') {
      return [
        ...baseColumns,
        {
          accessorKey: "action",
          header: "Aksi",
          cell: ({ row }) => (
            <button
              title="Download Slip Gaji"
              onClick={() => {
                window.open(`${API}/honor/pdf/${row.original.id}`, '_blank');
              }}
              className="text-blue-600 hover:text-blue-700 transition-colors"
            >
              <FaFileDownload className="text-lg" />
            </button>
          )
        }
      ];
    }

    return [
      ...baseColumns,
      {
        accessorKey: "action",
        header: "Aksi",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <button
              title="Detail Honor"
              onClick={() => {
                setSelectedHonor(row.original);
                setOpenDetailModal(true);
              }}
              className="text-blue-600 hover:text-blue-700 transition-colors"
            >
              <FaEye className="text-lg" />
            </button>
            
          </div>
        )
      }
    ];
  }, [activeTab]);

  const currentData = activeTab === 'paid' ? paidHonors : pendingHonors;

  return (
    <DashboardLayout>
      <DetailModal
        open={openDetailModal}
        onClose={() => setOpenDetailModal(false)}
        honorId={selectedHonor?.id}
      />
      
      

      <div className="space-y-6">
        {/* Card Honor Belum Cair */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
              <FaMoneyBill className="text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-700">Honor Belum Cair</h3>
              <p className="text-2xl font-bold">
                Rp {parseInt(walletBalance).toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        </div>
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex gap-6">
            <button
              onClick={() => setActiveTab('pending')}
              className={`pb-3 px-1 border-b-2 font-medium ${
                activeTab === 'pending'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Pending
              <span className="ml-2 bg-gray-100 px-2 py-1 rounded-full text-xs">
                {pendingHonors.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('paid')}
              className={`pb-3 px-1 border-b-2 font-medium ${
                activeTab === 'paid'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Dibayar
              <span className="ml-2 bg-gray-100 px-2 py-1 rounded-full text-xs">
                {paidHonors.length}
              </span>
            </button>
          </nav>
        </div>

        {/* Data Table */}
        {loading ? (
          <div className="text-center py-8 text-gray-500">Memuat data...</div>
        ) : (
          <DataTable
            data={currentData}
            columns={columns}
            onSearch={true}
            filterOptions={{
              title: `Honor ${activeTab === 'paid' ? 'Sudah' : 'Belum'} Dibayar`,
              description: `Kelola data honor ${activeTab === 'paid' ? 
                'yang sudah dibayar' : 'yang belum dibayar'}`,
              filters: []
            }}
            paginationOptions={{
              pageIndex: 0,
              pageSize: 10,
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}