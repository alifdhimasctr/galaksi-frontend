"use client";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import DataTable from "@/app/component/DataTable"; // Mengimpor DataTable modular yang sudah dibuat
// import AddTentorModal from "./addTentorModal";
// import EditTentorModal from "./editTentorModal";
// import DetailTentorModal from "./detailTentorModal";
// import DeleteTentorModal from "./deleteTentorModal";
import { FaEdit, FaEye, FaPlus, FaTrash } from "react-icons/fa";
import DashboardLayout from "@/app/component/dashboardLayout";
import AddTentorModal from "./addTentorModal";
import DetailTentorModal from "./detailTentorModal";
import EditTentorModal from "./editTentorModal";
import DeleteTentorModal from "./deleteTentorModal";
import { toast } from "react-hot-toast";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export default function TentorPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [tentorId, setTentorId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = Cookies.get("token");
        const apiUrl = `${API}/users/tentor`;
        console.log("Fetching data from:", apiUrl); // Log URL API yang dipanggil
        const { data } = await axios.get(apiUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRows(data);
      } catch (err) {
        
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const columns = useMemo(
    () => [
      { accessorKey: "id", header: "ID" },
      { accessorKey: "name", header: "NAMA TENTOR" },
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
        accessorKey: "level", // Menambahkan kolom level
        header: "LEVEL",
        cell: ({ getValue }) => {
          const levels = getValue();
          if (!Array.isArray(levels)) return null; // Jika level bukan array, tidak ditampilkan

          return (
            <div className="flex gap-1">
              {["TK", "SD", "SMP", "SMA"].map((level) => {
                if (!levels.includes(level)) return null;

                let badgeColor;

                // Tentukan warna berdasarkan level
                switch (level) {
                  case "TK":
                    badgeColor = "bg-blue-100 text-blue-700"; // Warna biru untuk TK
                    break;
                  case "SD":
                    badgeColor = "bg-green-100 text-green-700"; // Warna hijau untuk SD
                    break;
                  case "SMP":
                    badgeColor = "bg-yellow-100 text-yellow-700"; // Warna kuning untuk SMP
                    break;
                  case "SMA":
                    badgeColor = "bg-red-100 text-red-700"; // Warna merah untuk SMA
                    break;
                  default:
                    badgeColor = "bg-gray-100 text-gray-700"; // Warna default jika level tidak terdaftar
                }

                return (
                  <span
                    key={level}
                    className={`px-2 py-1 rounded-full text-xs font-medium ${badgeColor}`}
                  >
                    {level}
                  </span>
                );
              })}
            </div>
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
                setTentorId(row.original.id);
                setOpenDetailModal(true);
              }}
            >
              <FaEye className="text-blue-600 hover:text-blue-800" />
            </button>
            <button
              onClick={() => {
                setTentorId(row.original.id);
                setOpenEditModal(true);
              }}
            >
              <FaEdit className="text-yellow-600 hover:text-yellow-800" />
            </button>
            <button
              onClick={() => {
                setTentorId(row.original.id);
                setOpenDeleteModal(true);
              }}
            >
              <FaTrash className="text-red-600 hover:text-red-800" />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <DashboardLayout>
      {/* Modal Components */}
      <AddTentorModal
        open={openAddModal}
        onClose={() => setOpenAddModal(false)}
        onSuccess={() => {
          setLoading(true);
          axios
            .get(`${API}/users/tentor`, {
              headers: { Authorization: `Bearer ${Cookies.get("token")}` },
            })
            .then(({ data }) => setRows(data))
            .finally(() => setLoading(false));
        }}
      />

      <EditTentorModal
        open={openEditModal}
        onClose={() => setOpenEditModal(false)}
        tentorId={tentorId}
        onSuccess={() => {
          setLoading(true);
          axios
            .get(`${API}/users/tentor`, {
              headers: { Authorization: `Bearer ${Cookies.get("token")}` },
            })
            .then(({ data }) => setRows(data))
            .finally(() => setLoading(false));
        }}
      />
      <DetailTentorModal
        open={openDetailModal}
        onClose={() => setOpenDetailModal(false)}
        tentorId={tentorId}
      />
      <DeleteTentorModal
        open={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
        tentorId={tentorId}
        onSuccess={() => {
          setLoading(true);
          axios
            .get(`${API}/users/tentor`, {
              headers: { Authorization: `Bearer ${Cookies.get("token")}` },
            })
            .then(({ data }) => setRows(data))
            .finally(() => setLoading(false));
        }}
      />

      {/* DataTable Component */}
      <DataTable
        apiEndpoint="users/tentor"
        columns={columns}
        data={rows}
        onSearch={true}
        filterOptions={{
          title: "Data Tentor",
          description: "Kelola data tentor bimbingan",
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
            
          ],
        }}
        paginationOptions={{
          pageIndex: 0,
          pageSize: 25,
        }}
        onAdd={() => setOpenAddModal(true)} // Menambahkan modal saat tombol tambah diklik
      />
    </DashboardLayout>
  );
}
