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

export default function ProsharePage() {
  const [allProshares, setAllProshares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [selectedProshare, setSelectedProshare] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0); // State untuk menyimpan saldo wallet

  useEffect(() => {
    async function fetchData() {
      try {
        const token = Cookies.get("token");
        
        // Fetch data proshare dan wallet secara paralel
        const [prosharesRes, mitraRes] = await Promise.all([
          axios.get(`${API}/proshare?mitraId=${user.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API}/users/mitra/${user.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        ]);

        // Proses data proshare
        const processedProshares = prosharesRes.data.map((proshare) => ({
          ...proshare,
          siswa: proshare.siswa ? { id: proshare.siswa.id, name: proshare.siswa.name } : null,
          mitra: proshare.mitra ? { id: proshare.mitra.id, name: proshare.mitra.name } : null,
          paket: proshare.paket ? { id: proshare.paket.id, name: proshare.paket.name } : null,
        }));

        setAllProshares(processedProshares);
        
        // Set wallet balance dari response mitra
        if (mitraRes.data && mitraRes.data.wallet !== undefined) {
          setWalletBalance(mitraRes.data.wallet);
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
  const { pendingProshares, paidProshares } = useMemo(() => {
    return {
      pendingProshares: allProshares.filter(
        (p) => p.paymentStatus === "Pending"
      ),
      paidProshares: allProshares.filter((p) => p.paymentStatus === "Paid"),
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
          <span>Rp {parseInt(row.original.total).toLocaleString("id-ID")}</span>
        ),
      },
    ];

    if (activeTab === "paid") {
      return [
        ...baseColumns,
        {
          accessorKey: "action",
          header: "Aksi",
          cell: ({ row }) => (
            <button
              title="Download Slip Proshare"
              onClick={() => {
                window.open(`${API}/proshare/pdf/${row.original.id}`, "_blank");
              }}
              className="text-blue-600 hover:text-blue-700 transition-colors"
            >
              <FaFileDownload className="text-lg" />
            </button>
          ),
        },
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
            
          </div>
        ),
      },
    ];
  }, [activeTab]);

  const currentData = activeTab === "paid" ? paidProshares : pendingProshares;

  return (
    <DashboardLayout>
      <DetailModal
        open={openDetailModal}
        onClose={() => setOpenDetailModal(false)}
        proshareId={selectedProshare?.id}
      />

    

      <div className="space-y-6">
        {/* Card Profit Belum Cair */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
              <FaMoneyBill className="text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-700">Profit Belum Cair</h3>
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
              onClick={() => setActiveTab("pending")}
              className={`pb-3 px-1 border-b-2 font-medium ${
                activeTab === "pending"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Pending
              <span className="ml-2 bg-gray-100 px-2 py-1 rounded-full text-xs">
                {pendingProshares.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("paid")}
              className={`pb-3 px-1 border-b-2 font-medium ${
                activeTab === "paid"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
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
              title: `Proshare ${
                activeTab === "paid" ? "Sudah" : "Belum"
              } Dibayar`,
              description: `Kelola data proshare ${
                activeTab === "paid"
                  ? "yang sudah dibayar"
                  : "yang belum dibayar"
              }`,
              filters: [],
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
