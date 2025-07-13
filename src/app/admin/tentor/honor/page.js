"use client";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import DataTable from "@/app/component/DataTable";
import DashboardLayout from "@/app/component/dashboardLayout";
import { FaDownload, FaEye, FaFileDownload, FaMoneyBill } from "react-icons/fa";
import DetailModal from "./detailModal";
import PayModal from "./payModal";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export default function HonorPage() {
  const [allHonors, setAllHonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [openPayModal, setOpenPayModal] = useState(false);
  const [selectedHonor, setSelectedHonor] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const token = Cookies.get("token");
        const { data: honors } = await axios.get(`${API}/honor`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const processedHonors = honors.map(honor => ({
          ...honor,
          siswa: honor.siswa ? { 
            id: honor.siswa.id, 
            name: honor.siswa.name ,
            level: honor.siswa.level
          } : null,
          tentor: honor.tentor ? { 
            id: honor.tentor.id, 
            name: honor.tentor.name,
            bankName: honor.tentor.bankName,
            bankNumber: honor.tentor.bankNumber
          } : null,
        }));

        setAllHonors(processedHonors);
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
    const levelBadgeColor = level => {
      switch (level) {
      case "TK": return "bg-blue-200 text-blue-800";
      case "SD": return "bg-green-200 text-green-800";
      case "SMP": return "bg-yellow-200 text-yellow-800";
      case "SMA": return "bg-red-200 text-red-800";
      default: return "bg-gray-200 text-gray-800";
      }
    };

    const baseColumns = [
      { accessorKey: "tentor.name", header: "Nama Tentor" },
      { accessorKey: "siswa.name", header: "Nama Siswa" },
      { 
      accessorKey: "siswa.level", 
      header: "Jenjang Siswa",
      cell: ({ row }) => {
        const level = row.original.siswa?.level || "";
        return (
        <span className={`px-2 py-1 rounded-full text-xs ${levelBadgeColor(level)}`}>
          {level}
        </span>
        );
      }
      },
      { 
      accessorKey: "total", 
      header: "Total Honor",
      cell: ({ row }) => (
        <span>
        Rp {parseInt(row.original.total).toLocaleString('id-ID')}
        </span>
      )
      },

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
            <button
              title="Bayar Honor"
              onClick={() => {
                setSelectedHonor(row.original);
                setOpenPayModal(true);
              }}
              className="text-green-600 hover:text-green-700 transition-colors"
            >
              <FaMoneyBill className="text-lg" />
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
      
      <PayModal
        open={openPayModal}
        onClose={() => setOpenPayModal(false)}
        honorId={selectedHonor?.id}
        onSuccess={() => {
          setOpenPayModal(false);
          setLoading(true);
          axios
            .get(`${API}/honor`, {
              headers: { Authorization: `Bearer ${Cookies.get("token")}` },
            })
            .then(({ data }) => {
              const processedHonors = data.map(honor => ({
                ...honor,
                siswa: honor.siswa ? { 
                  id: honor.siswa.id, 
                  name: honor.siswa.name,
                  level: honor.siswa.level
                } : null,
                tentor: honor.tentor ? { 
                  id: honor.tentor.id, 
                  name: honor.tentor.name 
                } : null,
              }));
              setAllHonors(processedHonors);
            })
            .finally(() => setLoading(false));
        }}
      />

      <div className="space-y-6">
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