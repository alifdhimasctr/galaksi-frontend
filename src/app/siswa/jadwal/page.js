"use client";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import DataTable from "@/app/component/DataTable";
import DashboardLayout from "@/app/component/dashboardLayout";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
const user = Cookies.get("user") ? JSON.parse(Cookies.get("user")) : null;

export default function AttendancePage() {
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Absent');

  useEffect(() => {
    const fetchAttendances = async () => {
      try {
        const token = Cookies.get("token");
        const { data } = await axios.get(`${API}/jadwal/siswa/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAttendances(data);
      } catch (error) {
        console.error("Error fetching attendances:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendances();
  }, []);

  const filteredAttendances = useMemo(() => {
    return attendances.filter(a => a.attendanceStatus === activeTab);
  }, [attendances, activeTab]);

  const columns = useMemo(() => {
    const baseColumns = [
      { accessorKey: "tentorName", header: "Nama Tentor" },
      {
        header: "Hari/Tanggal",
        cell: ({ row }) => {
          const { dayName, date } = row.original;
          return <span>{dayName} - {date}</span>;
        }
      },
      { accessorKey: "time", header: "Waktu" },
      {
        accessorKey: "attendanceStatus",
        header: "Status",
        cell: ({ getValue }) => {
          const status = getValue();
          const statusStyle = {
            Absent: "bg-red-100 text-red-700",
            Present: "bg-green-100 text-green-700"
          };
          return (
            <span className={`px-2 py-1 rounded-full text-xs ${statusStyle[status]}`}>
              {status === 'Absent' ? 'Belum Hadir' : 'Hadir'}
            </span>
          );
        }
      }
    ];
    if (activeTab === "Present") {
      baseColumns.push({
        header: "Waktu Hadir",
        cell: ({ row }) => {
          const { presentAt } = row.original;
          return <span>{presentAt ? presentAt : "-"}</span>;
        }
      });
    }
    return baseColumns;
  }, [activeTab]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex gap-6">
            {['Absent', 'Present'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 px-1 border-b-2 font-medium ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'Absent' ? 'Belum Hadir' : 'Hadir'}
              </button>
            ))}
          </nav>
        </div>

        {/* Data Table */}
        {loading ? (
          <div className="text-center py-8 text-gray-500">Memuat data...</div>
        ) : (
          <DataTable
            data={filteredAttendances}
            columns={columns}
            onSearch={true}
            filterOptions={{
              title: `Kehadiran - ${activeTab === 'Absent' ? 'Belum Hadir' : 'Hadir'}`,
              description: `Kelola data kehadiran ${
                activeTab === 'Absent' ? 'yang belum tercatat' : 'yang sudah hadir'
              }`,
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
