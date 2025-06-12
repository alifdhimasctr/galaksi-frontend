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

export default function ProsharePage() {
  const [allProshares, setAllProshares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [openPayModal, setOpenPayModal] = useState(false);
  const [selectedProshare, setSelectedProshare] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const token = Cookies.get("token");
        const { data: proshares } = await axios.get(`${API}/proshare`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const processedProshares = proshares.map(proshare => ({
          ...proshare,
          siswa: proshare.siswa ? { 
            id: proshare.siswa.id, 
            name: proshare.siswa.name 
          } : null,
          mitra: proshare.mitra ? { 
            id: proshare.mitra.id, 
            name: proshare.mitra.name 
          } : null,
          paket: proshare.paket ? {
            id: proshare.paket.id,
            name: proshare.paket.name
          } : null
        }));

        setAllProshares(processedProshares);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Memisahkan data berdasarkan status pembayaran
  const { pendingProshares, paidProshares } = useMemo(() => {
    return {
      pendingProshares: allProshares.filter(p => p.paymentStatus === 'Pending'),
      paidProshares: allProshares.filter(p => p.paymentStatus === 'Paid')
    };
  }, [allProshares]);

  const columns = useMemo(() => {
    const baseColumns = [
      { accessorKey: "id", header: "ID Proshare" },
      { accessorKey: "mitra.name", header: "Nama Mitra" },
      { accessorKey: "siswa.name", header: "Nama Siswa" },
      { 
        accessorKey: "total", 
        header: "Total Proshare",
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
              title="Download Slip Proshare"
              onClick={() => {
                window.open(`${API}/proshare/pdf/${row.original.id}`, '_blank');
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
              title="Detail Proshare"
              onClick={() => {
                setSelectedProshare(row.original);
                setOpenDetailModal(true);
              }}
              className="text-blue-600 hover:text-blue-700 transition-colors"
            >
              <FaEye className="text-lg" />
            </button>
            <button
              title="Bayar Proshare"
              onClick={() => {
                setSelectedProshare(row.original);
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

  const currentData = activeTab === 'paid' ? paidProshares : pendingProshares;

  return (
    <DashboardLayout>
      <DetailModal
        open={openDetailModal}
        onClose={() => setOpenDetailModal(false)}
        proshareId={selectedProshare?.id}
      />
      
      <PayModal
        open={openPayModal}
        onClose={() => setOpenPayModal(false)}
        proshareId={selectedProshare?.id}
        onSuccess={() => {
          setOpenPayModal(false);
          setLoading(true);
          axios
            .get(`${API}/proshare`, {
              headers: { Authorization: `Bearer ${Cookies.get("token")}` },
            })
            .then(({ data }) => {
              const processedProshares = data.map(proshare => ({
                ...proshare,
                siswa: proshare.siswa ? { 
                  id: proshare.siswa.id, 
                  name: proshare.siswa.name 
                } : null,
                mitra: proshare.mitra ? { 
                  id: proshare.mitra.id, 
                  name: proshare.mitra.name 
                } : null,
                paket: proshare.paket ? {
                  id: proshare.paket.id,
                  name: proshare.paket.name
                } : null
              }));
              setAllProshares(processedProshares);
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
                {pendingProshares.length}
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
                {paidProshares.length}
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
              title: `Proshare ${activeTab === 'paid' ? 'Sudah' : 'Belum'} Dibayar`,
              description: `Kelola data proshare ${activeTab === 'paid' ? 
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