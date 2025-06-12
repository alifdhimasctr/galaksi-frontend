"use client";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import DataTable from "@/app/component/DataTable";  // Mengimpor DataTable modular yang sudah dibuat
import AddSiswaModal from "./addSiswaModal";
import EditSiswaModal from "./editSiswaModal";
import DetailSiswaModal from "./detailSiswaModal";
import DeleteSiswaModal from "./deleteSiswaModal";
import { FaEdit, FaEye, FaPlus, FaTrash } from "react-icons/fa";
import DashboardLayout from "@/app/component/dashboardLayout";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
const user  = Cookies.get("user") ? JSON.parse(Cookies.get("user")) : null;

export default function SiswaPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [siswaId, setSiswaId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = Cookies.get("token");

        const apiUrl = `${API}/users/siswa?mitraId=${user?.id || ""}`;
        console.log("Fetching data from:", apiUrl);  // Log URL API yang dipanggil
        const { data } = await axios.get(apiUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRows(data);
      } catch (err) {
        toast.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  

  const columns = useMemo(() => [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "name", header: "NAMA SISWA" },
    { accessorKey: "level", header: "KELAS" },
    { accessorKey: "parentName", header: "NAMA ORANG TUA" },
    {
      accessorKey: "mitraName",
      header: "MITRA",
      cell: ({ getValue }) => getValue() || "-",
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
              setSiswaId(row.original.id);
              setOpenDetailModal(true);
            }}
          >
            <FaEye className="text-blue-600 hover:text-blue-800" />
          </button>
          <button
            onClick={() => {
              setSiswaId(row.original.id);
              setOpenEditModal(true);
            }}
          >
            <FaEdit className="text-yellow-600 hover:text-yellow-800" />
          </button>
          <button
            onClick={() => {
              setSiswaId(row.original.id);
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
      {/* Modal Components */}
      <AddSiswaModal
  open={openAddModal}
  onClose={() => setOpenAddModal(false)}
  onSuccess={() => {
    setLoading(true);
    axios
      .get(`${API}/users/siswa?mitraId=${user.id}`, {
        headers: { Authorization: `Bearer ${Cookies.get("token")}` },
      })
      .then(({ data }) => setRows(data))
      .finally(() => setLoading(false));
  }}
/>

      <EditSiswaModal
        open={openEditModal}
        onClose={() => setOpenEditModal(false)}
        siswaId={siswaId}
        onSuccess={() => {
          setLoading(true);
          axios
            .get(`${API}/users/siswa?mitraId=${user.id}`, {
              headers: { Authorization: `Bearer ${Cookies.get("token")}` },
            })
            .then(({ data }) => setRows(data))
            .finally(() => setLoading(false));
        }}
      />
      <DetailSiswaModal
        open={openDetailModal}
        onClose={() => setOpenDetailModal(false)}
        siswaId={siswaId}
      />
      <DeleteSiswaModal
        open={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
        siswaId={siswaId}
        onSuccess={() => {
          setLoading(true);
          axios
            .get(`${API}/users/siswa?mitraId=${user.id}`, {
              headers: { Authorization: `Bearer ${Cookies.get("token")}` },
            })
            .then(({ data }) => setRows(data))
            .finally(() => setLoading(false));
        }}
      />

      {/* DataTable Component */}
      <DataTable
        apiEndpoint="users/siswa"
        columns={columns}
        data={rows}
        onSearch={true}
        filterOptions={{
          title: "Data Siswa",
          description: "Kelola data siswa bimbingan",
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
              onChange: (value) => {
                // Implement filtering logic for status
                console.log("Filter status changed to:", value);
              },
            },
            {
              id: "level",
              label: "Kelas",
              value: "Semua Kelas",
              options: [
                { value: "", label: "Semua Kelas" },
                { value: "TK", label: "TK" },
                { value: "SD", label: "SD" },
                { value: "SMP", label: "SMP" },
                { value: "SMA", label: "SMA" },
              ],
              onChange: (value) => {
                // Implement filtering logic for level
                console.log("Filter level changed to:", value);
              },
            },
          ],
        }}
        paginationOptions={{
          pageIndex: 0,
          pageSize: 10,
        }}
        onAdd={() => setOpenAddModal(true)} // Menambahkan modal saat tombol tambah diklik
      />
    </DashboardLayout>
  );
}
