"use client";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import DataTable from "@/app/component/DataTable";
import DashboardLayout from "@/app/component/dashboardLayout";
import { FaCheckCircle, FaTimesCircle, FaCalendarAlt } from "react-icons/fa";
import Modal from "@/app/component/modal";
import ApproveTentorModal from "./approveModal";
import RejectTentorModal from "./rejectModal";
import PresentModal from "./presensiModal";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export default function AttendancePage() {
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Absent');
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [openApproveModal, setOpenApproveModal] = useState(false);
  const [openRejectModal, setOpenRejectModal] = useState(false);
  const [openPresentModal, setOpenPresentModal] = useState(false);

  useEffect(() => {
    const fetchAttendances = async () => {
      try {
        const token = Cookies.get("token");
        const { data } = await axios.get(`${API}/jadwal`, {
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
      { accessorKey: "siswaName", header: "Nama Siswa" },
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
            Present: "bg-green-100 text-green-700",
            RescheduleRequest: "bg-orange-100 text-orange-700"
          };
          return (
            <span className={`px-2 py-1 rounded-full text-xs ${statusStyle[status]}`}>
              {status === 'Absent' ? 'Belum Hadir'
                : status === 'Present' ? 'Hadir'
                : 'Request Reschedule'}
            </span>
          );
        }
      }
    ];

    if (activeTab === 'Absent') {
      return [
        ...baseColumns,
        {
          accessorKey: "action",
          header: "Aksi",
          cell: ({ row }) => (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedAttendance(row.original.id);
                  setOpenPresentModal(true);
                }}
                className="text-green-600 hover:text-green-700"
              >
                <FaCheckCircle size={20} />
              </button>
              
            </div>
          )
        }
      ];
    }

    if (activeTab === 'Present') {
      return [
        ...baseColumns,
        {
          header: "Waktu Hadir",
          cell: ({ row }) => {
            const { presentAt } = row.original;
            return <span>{presentAt ? presentAt : "-"}</span>;
          }
        }
      ];
    }

    if (activeTab === 'RescheduleRequest') {
      return [
        ...baseColumns,
        {
          accessorKey: "action",
          header: "Aksi",
          cell: ({ row }) => (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedAttendance(row.original.id);
                  setOpenApproveModal(true);
                }}
                className="text-green-600 hover:text-green-700"
              >
                <FaCheckCircle size={20} />
              </button>
              <button
                onClick={() => {
                  setSelectedAttendance(row.original.id);
                  setOpenRejectModal(true);
                }}
                className="text-red-600 hover:text-red-700"
              >
                <FaTimesCircle size={20} />
              </button>
            </div>
          )
        }
      ];
    }

    return baseColumns;
  }, [activeTab]);


  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex gap-6">
            {['Absent', 'Present', 'RescheduleRequest'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 px-1 border-b-2 font-medium ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'Absent' ? 'Belum Hadir' : 
                 tab === 'Present' ? 'Hadir' : 'Request Reschedule'}
                {
                  tab === 'RescheduleRequest' && (
                    <span className="ml-2 bg-gray-100 px-2 py-1 rounded-full text-xs">
                  {attendances.filter(a => a.attendanceStatus === tab).length}
                </span>
                  )
                }
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
              title: `Kehadiran - ${activeTab === 'Absent' ? 'Belum Hadir' : 
                       activeTab === 'Present' ? 'Hadir' : 'Request Reschedule'}`,
              description: `Kelola data kehadiran ${activeTab === 'Absent' ? 
                'yang belum tercatat' : activeTab === 'Present' ? 
                'yang sudah hadir' : 'permintaan reschedule'}`,
              filters: []
            }}
            paginationOptions={{
              pageIndex: 0,
              pageSize: 10,
            }}
          />
        )}

        {/* Action Modal */}
        <ApproveTentorModal
          open={openApproveModal}
          onClose={() => setOpenApproveModal(false)}
          jadwalId={selectedAttendance}
          onSuccess={() => {
            setOpenApproveModal(false);
            axios
              .get(`${API}/jadwal`, {
                headers: { Authorization: `Bearer ${Cookies.get("token")}` },
              })
              .then(({ data }) => {
                setAttendances(data);
              })
              .finally(() => setLoading(false));
          }}
        />
        <RejectTentorModal
          open={openRejectModal}
          onClose={() => setOpenRejectModal(false)}
          jadwalId={selectedAttendance}
          onSuccess={() => {
            setOpenRejectModal(false);
            axios
              .get(`${API}/jadwal`, {
                headers: { Authorization: `Bearer ${Cookies.get("token")}` },
              })
              .then(({ data }) => {
                setAttendances(data);
              })
              .finally(() => setLoading(false));
          }}
        />
        <PresentModal
          open={openPresentModal}
          onClose={() => setOpenPresentModal(false)}
          jadwalId={selectedAttendance}
          refreshData={() => {
            setOpenPresentModal(false);
            axios
              .get(`${API}/jadwal`, {
                headers: { Authorization: `Bearer ${Cookies.get("token")}` },
              })
              .then(({ data }) => {
                setAttendances(data);
              })
              .finally(() => setLoading(false));
          }}
        />
        
      </div>
    </DashboardLayout>
  );
}