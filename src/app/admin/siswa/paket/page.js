"use client";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import DataTable from "@/app/component/DataTable";
import DashboardLayout from "@/app/component/dashboardLayout";
import { FaCheckCircle, FaTimesCircle, FaEdit, FaTrash } from "react-icons/fa";
import Modal from "@/app/component/modal";
import toast from "react-hot-toast";
import EditModal from "./editModal";
import DeleteModal from "./deleteModal";
import ApproveModal from "./approveModal";
import RejectModal from "./rejectModal";
import AdminOrderPage from "./orderPage";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export default function ApprovePaketPage() {
  const [orders, setOrders] = useState([]);
  const [tentors, setTentors] = useState([]);
  const [mapel, setMapel] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("NonApprove");
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [openApproveModal, setOpenApproveModal] = useState(false);
  const [openRejectModal, setOpenRejectModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openAddModal, setOpenAddModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = Cookies.get("token");
        const [ordersRes, tentorsRes, mapelRes] = await Promise.all([
          axios.get(`${API}/order/all`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API}/users/tentor`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API}/mapel`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setOrders(ordersRes.data);
        setTentors(tentorsRes.data);
        setMapel(mapelRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const tentorOptions = useMemo(() => {
    return tentors.map((tentor) => ({
      value: tentor.id,
      label: `${tentor.name} (${tentor.email})`,
    }));
  }, [tentors]);

  const mapelOptions = useMemo(() => {
    return mapel.map((m) => ({
      value: m.id,
      label: `${m.name} (${m.kelas})`,
    }));
  }, [mapel]);

  const filteredOrders = useMemo(
    () => orders.filter((order) => order.status === activeTab),
    [orders, activeTab]
  );

  const columns = useMemo(
    () => [
      { accessorKey: "siswa.name", header: "Nama Siswa" },
      { accessorKey: "tentor.name", header: "Tentor" },
      { accessorKey: "paket.name", header: "Paket" },
      { accessorKey: "meetingDay", header: "Jadwal" },
      ...(activeTab === "NonApprove"
        ? [
            {
              accessorKey: "action",
              header: "Aksi",
              cell: ({ row }) => (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedOrderId(row.original.id);
                      setOpenApproveModal(true);
                    }}
                    className="text-green-600 hover:text-green-700"
                  >
                    <FaCheckCircle />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedOrderId(row.original.id);
                      setOpenRejectModal(true);
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    <FaTimesCircle />
                  </button>
                </div>
              ),
            },
          ]
        : []),
      ...(activeTab === "Approve" || activeTab === "Reject"
        ? [
            {
              accessorKey: "action",
              header: "Aksi",
              cell: ({ row }) => (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedOrderId(row.original.id);
                      setOpenEditModal(true);
                      
                    }}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedOrderId(row.original.id);
                      setOpenDeleteModal(true);
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    <FaTrash />
                  </button>
                </div>
              ),
            },
          ]
        : []),
    ],
    [activeTab]
  );

  const refreshOrders = () => {
    axios
      .get(`${API}/order/all`, { headers: { Authorization: `Bearer ${Cookies.get("token")}` } })
      .then(({ data }) => setOrders(data))
      .catch((error) => console.error("Error fetching orders:", error));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="border-b border-gray-200">
          <nav className="flex gap-6">
            {[
              { key: "NonApprove", label: "Belum Disetujui" },
              { key: "Approve", label: "Disetujui" },
              { key: "Reject", label: "Ditolak" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`pb-3 px-1 border-b-2 font-medium ${
                  activeTab === tab.key
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
                <span className="ml-2 bg-gray-100 px-2 py-1 rounded-full text-xs">
                  {orders.filter((o) => o.status === tab.key).length}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Memuat data...</div>
        ) : (
          <DataTable
            data={filteredOrders}
            onAdd={() => setOpenAddModal(true)}
            columns={columns}
            onSearch={true}
            filterOptions={{
              title: `Paket ${["NonApprove", "Approve", "Reject"].find(t => t === activeTab) === "NonApprove"
                ? "Belum Disetujui"
                : activeTab === "Approve"
                ? "Disetujui"
                : "Ditolak"
              }`,
              description: `Kelola paket dengan status ${
                ["NonApprove", "Approve", "Reject"].find(t => t === activeTab) === "NonApprove"
                  ? "belum disetujui"
                  : activeTab === "Approve"
                  ? "disetujui"
                  : "ditolak"
              }`,
              filters: [],
            }}
            paginationOptions={{
              pageIndex: 0,
              pageSize: 10,
            }}
          />
        )}

        <AdminOrderPage
          open={openAddModal}
          onClose={() => {
            setOpenAddModal(false);
            refreshOrders();
          }}
          onSuccess={() => {
            refreshOrders();
          }}
        />

        <EditModal
          open={openEditModal}
          onClose={() => {
            setOpenEditModal(false);
            setSelectedOrderId(null);
          }}
          onSuccess={() => {
            refreshOrders();
            toast.success("Order berhasil diperbarui");
          }}
          orderId={selectedOrderId}
        />

        <DeleteModal
          open={openDeleteModal}
          onClose={() => {
            setOpenDeleteModal(false);
            setSelectedOrderId(null);
          }}
          onSuccess={() => {
            refreshOrders();
            toast.success("Order berhasil dihapus");
          }}
          orderId={selectedOrderId}
        />

        <ApproveModal
          open={openApproveModal}
          onClose={() => {
            setOpenApproveModal(false);
            setSelectedOrderId(null);
          }}
          orderId={selectedOrderId}
          onSuccess={() => {
            refreshOrders();
            toast.success("Order berhasil disetujui");
          }}
        />

        <RejectModal
          open={openRejectModal}
          onClose={() => {
            setOpenRejectModal(false);
            setSelectedOrderId(null);
          }}
          orderId={selectedOrderId}
          onSuccess={() => {
            refreshOrders();
            toast.success("Order berhasil ditolak");
          }}
        />
      </div>
    </DashboardLayout>
  );
}
