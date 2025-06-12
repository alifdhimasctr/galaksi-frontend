"use client";
import { use, useEffect, useMemo, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import DataTable from "@/app/component/DataTable"; // Mengimpor DataTable modular yang sudah dibuat
// import AddPaketModal from "./addPaketModal";
// import EditPaketModal from "./editPaketModal";
// import DetailPaketModal from "./detailPaketModal";
// import DeletePaketModal from "./deletePaketModal";
import { FaEdit, FaEye, FaPlus, FaTrash } from "react-icons/fa";
import DashboardLayout from "@/app/component/dashboardLayout";
import AddPaketModal from "./addPaketModal";
import DetailPaketModal from "./detailPaketModal";
import EditPaketModal from "./editPaketModal";
import DeletePaketModal from "./deletePaketModal";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export default function PaketPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [paketId, setPaketId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = Cookies.get("token");
        const apiUrl = `${API}/paket`;
        console.log("Fetching data from:", apiUrl); // Log URL API yang dipanggil
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

  const columns = useMemo(
    () => [
      { accessorKey: "name", header: "NAMA PAKET" },
      {
        accessorKey: "category",
        header: "KATEGORI",
        cell: ({ getValue }) => {
          const category = getValue();

          let color;
          switch (category) {
            case "Kurikulum Nasional":
              color = "blue";
              break;
            case "Kurikulum Internasional":
              color = "green";
              break;
            case "Life Skill":
              color = "yellow";
              break;
            case "Bahasa Asing":
              color = "red";
              break;
            default:
              color = "gray";
          }
          return (
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium bg-${color}-100 text-${color}-700`}
            >
              {category}
            </span>
          );
        },
      },
      {
        accessorKey: "level",
        header: "KELAS",
        cell: ({ getValue }) => {
          const level = getValue();

          let color;
          switch (level) {
            case "TK":
              color = "purple";
              break;
            case "SD":
              color = "blue";
              break;
            case "SMP":
              color = "green";
              break;
            case "SMA":
              color = "yellow";
              break;
            default:
              color = "gray";
          }
          return (
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium bg-${color}-100 text-${color}-700`}
            >
              {level}
            </span>
          );
        },
      },
      {
        accessorKey: "price",
        header: "HARGA",
        cell: ({ getValue }) => {
          const price = getValue();
          return (
            <span className="font-medium">{`Rp ${price.toLocaleString(
              "id-ID"
            )}`}</span>
          );
        },
      },
      {
        accessorKey: "status",
        header: "STATUS",
        cell: ({ getValue }) => {
          const status = getValue();
          const displayText = status === "Aktif" ? "Aktif" : "Nonaktif";
          return (
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                status === "Aktif"
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
                setPaketId(row.original.id);
                setOpenDetailModal(true);
              }}
            >
              <FaEye className="text-blue-600 hover:text-blue-800" />
            </button>
            <button
              onClick={() => {
                setPaketId(row.original.id);
                setOpenEditModal(true);
              }}
            >
              <FaEdit className="text-yellow-600 hover:text-yellow-800" />
            </button>
            <button
              onClick={() => {
                setPaketId(row.original.id);
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
      <AddPaketModal
        onClose={() => setOpenAddModal(false)}
        open={openAddModal}
        onSuccess={() => {
          setOpenAddModal(false);
          // Fetch data again after adding a new paket
          const fetchData = async () => {
            try {
              const token = Cookies.get("token");
              const apiUrl = `${API}/paket`;
              const { data } = await axios.get(apiUrl, {
                headers: { Authorization: `Bearer ${token}` },
              });
              setRows(data);
            } catch (err) {
              toast.error("Error fetching data:", err);
            }
          };
          fetchData();
        }}
      />
      <DetailPaketModal
        open={openDetailModal}
        onClose={() => setOpenDetailModal(false)}
        paketId={paketId}
      />
      <EditPaketModal
        open={openEditModal}
        onClose={() => setOpenEditModal(false)}
        paketId={paketId}
        onSuccess={() => {
          setOpenEditModal(false);
          // Fetch data again after editing a paket
          const fetchData = async () => {
            try {
              const token = Cookies.get("token");
              const apiUrl = `${API}/paket`;
              const { data } = await axios.get(apiUrl, {
                headers: { Authorization: `Bearer ${token}` },
              });
              setRows(data);
            } catch (err) {
              toast.error("Error fetching data:", err);
            }
          };
          fetchData();
        }}
      />
      <DeletePaketModal
        open={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
        paketId={paketId}
        onSuccess={() => {
          setOpenDeleteModal(false);
          // Fetch data again after deleting a paket
          const fetchData = async () => {
            try {
              const token = Cookies.get("token");
              const apiUrl = `${API}/paket`;
              const { data } = await axios.get(apiUrl, {
                headers: { Authorization: `Bearer ${token}` },
              });
              setRows(data);
            } catch (err) {
              toast.error("Error fetching data:", err);
            }
          };
          fetchData();
        }}
      />
      <DataTable
        apiEndpoint="/paket"
        columns={columns}
        data={rows}
        onSearch={true}
        onAdd={() => setOpenAddModal(true)}
        filterOptions={{
          title: "Paket",
          description: "Kelola data paket di sini",
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
            {
              id: "category",
              label: "Kategori",
              value: "Semua Kategori",
              options: [
                { value: "", label: "Semua Kategori" },
                { value: "Kurikulum Nasional", label: "Kurikulum Nasional" },
                {
                  value: "Kurikulum Internasional",
                  label: "Kurikulum Internasional",
                },
                { value: "Life Skill", label: "Life Skill" },
                { value: "Bahasa Asing", label: "Bahasa Asing" },
              ],
              onChange: (value) => {
                // Implement filtering logic for category
                console.log("Filter category changed to:", value);
              },
            },
          ],
        }}
        paginationOptions={{
          pageIndex: 0,
          pageSize: 10,
        }}
      />
    </DashboardLayout>
  );
}
