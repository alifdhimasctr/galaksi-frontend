"use client";
import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import DashboardLayout from "@/app/component/dashboardLayout";
import DataTable from "@/app/component/DataTable";
import AddMapelModal from "./addMapelModal";
import DeleteMapelModal from "./deleteMapelModal";
import { FaTrash } from "react-icons/fa";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export default function MapelPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = Cookies.get("token");
        const apiUrl = `${API}/mapel`;
        const { data } = await axios.get(apiUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRows(data);
      } catch (err) {
        console.error("Error fetching mapel:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
const columns = useMemo(() => [
    { accessorKey: "name", header: "Nama Mapel" },
    {
        id: "actions",
        header: "Aksi",
        cell: ({ row }) => {
            const { id } = row.original;
            return (
                <button onClick={() => setShowDeleteModal(id)}>
                    <FaTrash className="text-red-500"
                    title="Hapus" />
                </button>
            );
        },
    },
], []);

  const handleAdd = () => {
    setShowAddModal(true);
  };

  return (
    <DashboardLayout>
      <DataTable
        apiEndpoint="/mapel"
        columns={columns}
        data={rows}
        loading={loading}
        onSearch={true}
        onAdd={handleAdd}
        filterOptions={{
          title: "Mapel",
          description: "Kelola daftar mata pelajaran",
        }}
        paginationOptions={{
          pageIndex: 0,
          pageSize: 10,
        }}
      />
      <DeleteMapelModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onSuccess={() => {
          setShowDeleteModal(false);
          setLoading(true);
          // Re-fetch data after deletion
          axios
            .get(`${API}/mapel`, {
              headers: { Authorization: `Bearer ${Cookies.get("token")}` },
            })
            .then((response) => {
              setRows(response.data);
              setLoading(false);
            })
            .catch((err) => {
              console.error("Error re-fetching mapel:", err);
              setLoading(false);
            });
        }}
        mapelId={showDeleteModal}
      />
      <AddMapelModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          setShowAddModal(false);
          setLoading(true);
          // Re-fetch data after adding a new mapel
          axios
            .get(`${API}/mapel`, {
              headers: { Authorization: `Bearer ${Cookies.get("token")}` },
            })
            .then((response) => {
              setRows(response.data);
              setLoading(false);
            })
            .catch((err) => {
              console.error("Error re-fetching mapel:", err);
              setLoading(false);
            });
        }}
      />
    </DashboardLayout>
  );
}
