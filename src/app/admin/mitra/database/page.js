"use client";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import DataTable from "@/app/component/DataTable";
import AddMitraModal from "./addMitraModal";
import EditMitraModal from "./editMitraModal";
import DetailMitraModal from "./detailMitraModal";
import DeleteMitraModal from "./deleteMitraModal";
import { FaEdit, FaEye, FaPlus, FaTrash } from "react-icons/fa";
import DashboardLayout from "@/app/component/dashboardLayout";
import toast from "react-hot-toast";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export default function MitraPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [mitraId, setMitraId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = Cookies.get("token");
        const { data } = await axios.get(`${API}/users/mitra`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRows(data);
      } catch (err) {
        toast.error("Error fetching data: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const columns = useMemo(() => [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "name", header: "NAMA MITRA" },
    {
      accessorKey: "totalSiswa",
      header: "TOTAL SISWA",
      cell: ({ row }) => row.original.siswa?.length || 0,
    },
    {
      accessorKey: "status",
      header: "STATUS",
      cell: ({ getValue }) => {
        const status = getValue();
        const displayText = status === "active" ? "Aktif" : "Nonaktif";
        return (
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              status === "active"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-600"
            }`}
          >
            {displayText}
          </span>
        );
      },
    },
    {
      accessorKey: "actions",
      header: "AKSI",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button
            onClick={() => {
              setMitraId(row.original.id);
              setOpenDetailModal(true);
            }}
          >
            <FaEye className="text-blue-600 hover:text-blue-800" />
          </button>
          <button
            onClick={() => {
              setMitraId(row.original.id);
              setOpenEditModal(true);
            }}
          >
            <FaEdit className="text-yellow-600 hover:text-yellow-800" />
          </button>
          <button
            onClick={() => {
              setMitraId(row.original.id);
              setOpenDeleteModal(true);
            }}
          >
            <FaTrash className="text-red-600 hover:text-red-800" />
          </button>
        </div>
      ),
    },
  ], []);

  return (
    <DashboardLayout>
      <AddMitraModal
        open={openAddModal}
        onClose={() => setOpenAddModal(false)}
        onSuccess={() => {
          setLoading(true);
          axios
            .get(`${API}/users/mitra`, {
              headers: { Authorization: `Bearer ${Cookies.get("token")}` },
            })
            .then(({ data }) => setRows(data))
            .finally(() => setLoading(false));
        }}
      />

      <EditMitraModal
        open={openEditModal}
        onClose={() => setOpenEditModal(false)}
        mitraId={mitraId}
        onSuccess={() => {
          setLoading(true);
          axios
            .get(`${API}/users/mitra`, {
              headers: { Authorization: `Bearer ${Cookies.get("token")}` },
            })
            .then(({ data }) => setRows(data))
            .finally(() => setLoading(false));
        }}
      />
      
      <DetailMitraModal
        open={openDetailModal}
        onClose={() => setOpenDetailModal(false)}
        mitraId={mitraId}
      />
      
      <DeleteMitraModal
        open={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
        mitraId={mitraId}
        onSuccess={() => {
          setLoading(true);
          axios
            .get(`${API}/users/mitra`, {
              headers: { Authorization: `Bearer ${Cookies.get("token")}` },
            })
            .then(({ data }) => setRows(data))
            .finally(() => setLoading(false));
        }}
      />

      <DataTable
        apiEndpoint="users/mitra"
        columns={columns}
        data={rows}
        onSearch={true}
        filterOptions={{
          title: "Data Mitra",
          description: "Kelola data mitra bimbingan",
          filters: [
            {
              id: "status",
              label: "Status",
              value: "Semua Status",
              options: [
                { value: "", label: "Semua Status" },
                { value: "active", label: "Aktif" },
                { value: "nonactive", label: "Nonaktif" },
              ],
              onChange: (value) => console.log("Filter status changed to:", value),
            },
            
          ],
        }}
        paginationOptions={{
          pageIndex: 0,
          pageSize: 10,
        }}
        onAdd={() => setOpenAddModal(true)}
      />
    </DashboardLayout>
  );
}