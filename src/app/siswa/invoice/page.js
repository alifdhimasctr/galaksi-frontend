"use client";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import DataTable from "@/app/component/DataTable";
import DashboardLayout from "@/app/component/dashboardLayout";
import { FaDownload, FaEye, FaFileDownload, FaHornbill, FaMoneyBill, FaTag } from "react-icons/fa";
import PayModal from "./payModal";


const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
const user = Cookies.get("user") ? JSON.parse(Cookies.get("user")) : null;

export default function InvoicePage() {
  const [allInvoices, setAllInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('unpaid');
  const [openPayModal, setOpenPayModal] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [apiEndpoint, setApiEndpoint] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const user  = Cookies.get("user") ? JSON.parse(Cookies.get("user")) : null;
        const token = Cookies.get("token");
        const { data: invoices } = await axios.get(`${API}/invoices?siswaId=${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const processedInvoices = invoices.map(invoice => ({
          ...invoice,
          siswa: invoice.siswa ? { 
            id: invoice.siswa.id, 
            name: invoice.siswa.name, 
            level: invoice.siswa.level 
          } : null,
          mitra: invoice.mitra ? { 
            id: invoice.mitra.id, 
            name: invoice.mitra.name 
          } : null,
          paket: invoice.paket ? { 
            id: invoice.paket.id, 
            name: invoice.paket.name 
          } : null,
        }));

        setAllInvoices(processedInvoices);
      } catch (err) {
        toast.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Memisahkan data berdasarkan status pembayaran
  const { paidInvoices, unpaidInvoices } = useMemo(() => {
    return {
      paidInvoices: allInvoices.filter(i => i.paymentStatus === 'Paid'),
      unpaidInvoices: allInvoices.filter(i => i.paymentStatus === 'Unpaid')
    };
  }, [allInvoices]);

  const columns = useMemo(() => {
    const baseColumns = [
      { accessorKey: "siswa.name", header: "Nama Siswa" },
      { accessorKey: "mitra.name", header: "Mitra" },
      { accessorKey: "paket.name", header: "Paket" },
      { accessorKey: "price", header: "Total Harga" },
    ];

    if(activeTab === 'paid') {
      return [
        ...baseColumns,
        {
          accessorKey: "transferProof",
          header: "Bukti Transfer",
          cell: ({ row }) => {
            const transferProofUrl = row.original.transferProof
              ? `${API}/${row.original.transferProof}`
              : null;
            return transferProofUrl ? (
              <img 
                src={transferProofUrl} 
                alt="Bukti Transfer" 
                className="max-w-[100px] max-h-[100px] cursor-pointer hover:opacity-75"
                onClick={() => window.open(transferProofUrl, '_blank')}
              />
            ) : <span className="text-gray-400">-</span>;
          }
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
            title="Bayar Invoice"
              onClick={() => {
                setSelectedRowId(row.original.id);
                setOpenPayModal(true);
              }}
              className="text-green-600 hover:text-green-700 transition-colors"
            >
              <FaMoneyBill className="text-lg" />
            </button>
            <button
            title="Download Invoice"
              onClick={() => {
                setSelectedRowId(row.original.id);
                setApiEndpoint(`${API}/invoice/${row.original.id}`);
                window.open(`${API}/invoice/pdf/${row.original.id}`, '_blank');
              }}
              className="text-blue-600 hover:text-blue-700 transition-colors"
            >
              <FaFileDownload className="text-lg" />
            </button>

          </div>
        )
      }
    ];
  }, [activeTab]);

  const currentData = activeTab === 'paid' ? paidInvoices : unpaidInvoices;

  return (
    <DashboardLayout>
      <PayModal
        open={openPayModal}
        onClose={() => setOpenPayModal(false)}
        invoiceId={selectedRowId}
        onSuccess={() => {
            setOpenPayModal(false);
            setLoading(true);
            axios
                .get(`${API}/invoices`, {
                headers: { Authorization: `Bearer ${Cookies.get("token")}` },
                })
                .then(({ data }) => {
                const processedInvoices = data.map(invoice => ({
                    ...invoice,
                    siswa: invoice.siswa ? { 
                    id: invoice.siswa.id, 
                    name: invoice.siswa.name, 
                    level: invoice.siswa.level 
                    } : null,
                    mitra: invoice.mitra ? { 
                    id: invoice.mitra.id, 
                    name: invoice.mitra.name 
                    } : null,
                    paket: invoice.paket ? { 
                    id: invoice.paket.id, 
                    name: invoice.paket.name 
                    } : null,
                }));
                setAllInvoices(processedInvoices);
                })
                .finally(() => setLoading(false));
        }}
      />

      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex gap-6">
            <button
              onClick={() => setActiveTab('unpaid')}
              className={`pb-3 px-1 border-b-2 font-medium ${
                activeTab === 'unpaid'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Belum Dibayar
              <span className="ml-2 bg-gray-100 px-2 py-1 rounded-full text-xs">
                {unpaidInvoices.length}
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
              Sudah Dibayar
              <span className="ml-2 bg-gray-100 px-2 py-1 rounded-full text-xs">
                {paidInvoices.length}
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
              title: `Invoice ${activeTab === 'paid' ? 'Sudah' : 'Belum'} Dibayar`,
              description: `Kelola data invoice ${activeTab === 'paid' ? 
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