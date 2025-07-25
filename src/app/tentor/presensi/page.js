"use client";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import DataTable from "@/app/component/DataTable";
import DashboardLayout from "@/app/component/dashboardLayout";
import { FaCheckCircle, FaTimesCircle, FaCalendarAlt, FaClipboard, FaCopy } from "react-icons/fa";
import RescheduleModal from "./rescheduleModal";
import PresentModal from "./presensiModal";
import { FiCopy } from "react-icons/fi";
import toast from "react-hot-toast";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
const user = JSON.parse(Cookies.get("user") || "{}");

export default function PresensiTentorPage() {
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Absent");
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [openPresentModal, setOpenPresentModal] = useState(false);
  const [openRescheduleModal, setOpenRescheduleModal] = useState(false);
  const [selectedJadwal, setSelectedJadwal] = useState(null);

  useEffect(() => {
    const fetchAttendances = async () => {
      try {
        const user = JSON.parse(Cookies.get("user") || "{}");
        const token = Cookies.get("token");
        const { data } = await axios.get(`${API}/jadwal/tentor/${user.id}`, {
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
  }, [user.id]);

  const filteredAttendances = useMemo(() => {
    return attendances.filter((a) => a.attendanceStatus === activeTab);
  }, [attendances, activeTab]);

  const columns = useMemo(() => {
    const baseColumns = [
      { accessorKey: "siswaName", header: "Nama Siswa" },
      {
        header: "Hari/Tanggal",
        cell: ({ row }) => {
          const { dayName, date } = row.original;
          return (
            <span>
              {dayName} - {date}
            </span>
          );
        },
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
            RescheduleRequest: "bg-orange-100 text-orange-700",
            PresentRequest: "bg-yellow-100 text-yellow-700", // Tambahkan ini
          };
          return (
            <span
              className={`px-2 py-1 rounded-full text-xs ${statusStyle[status]}`}
            >
              {status === "Absent"
                ? "Belum Hadir"
                : status === "Present"
                ? "Hadir"
                : status === "PresentRequest"
                ? "Menunggu Konfirmasi" // Status baru
                : "Request Reschedule"}
            </span>
          );
        },
      },
    ];

    if (activeTab === "PresentRequest") {
      return [
        ...baseColumns,
        {
          accessorKey: "action",
          header: "Aksi",
          cell: ({ row }) => {
            const noHp = row.original.noHp;
            const confirmLink = `${window.location.origin}/siswa/jadwal/${row.original.id}`;
            return (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(confirmLink);
                    toast.success("Link Konfirmasi Berhasil disalin")
                  }}
                  className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                  title="Salin Link Konfirmasi"
                >
                  <FiCopy/>
                </button>
                
              </div>
            );
          },
        },
      ];
    }

    if (activeTab === "Absent") {
      return [
      ...baseColumns,
      {
        accessorKey: "action",
        header: "Aksi",
        cell: ({ row }) => (
        <div className="flex gap-2">
          <button
          onClick={() => {
            setSelectedJadwal(row.original.id);
            console.log("Selected Jadwal ID:", row.original.id);
            setOpenRescheduleModal(true);
          }}
          className="p-2 text-red-600 hover:bg-green-100 rounded-lg"
          title="Ajukan Reschedule"
          >
          <FaCalendarAlt size={20} />
          </button>
          <button
          onClick={() => {
            setSelectedJadwal(row.original.id);
            setOpenPresentModal(true);
          }}
          className="p-2 text-green-600 hover:bg-green-100 rounded-lg"
          title="Catat Kehadiran"
          >
          <FaCheckCircle size={20} />
          </button>
        </div>
        ),
      },
      ];
    }

    // Jika tab aktif "Present", tambahkan kolom waktu presensi
    if (activeTab === "Present") {
      return [
      ...baseColumns,
      {
        accessorKey: "presensiTime",
        header: "Waktu Presensi",
        cell: ({ row }) => {
        const presensiTime = row.original.presentAt;
        return (
          <span className="text-green-700 font-medium">
          {presensiTime ? presensiTime : "-"}
          </span>
        );
        },
      },
      ];
    }

    return baseColumns;
  }, [activeTab]);

  return (
    <DashboardLayout>
      <div className="space-y-6">

          <div className="border-b border-gray-200">
            <nav className="flex gap-6">
              {["Absent", "Present", "RescheduleRequest", "PresentRequest"].map((tab) => (
                <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-1 border-b-2 font-medium ${
              activeTab === tab
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
                >
            {tab === "Absent"
              ? "Belum Hadir"
              : tab === "Present"
              ? "Hadir"
              : tab === "PresentRequest"
              ? "Menunggu Konfirmasi Hadir"
              : "Request Ganti Tentor"}
            <span className="ml-2 bg-gray-100 px-2 py-1 rounded-full text-xs">
              {attendances.filter((a) => a.attendanceStatus === tab).length}
            </span>
                </button>
              ))}
            </nav>
          </div>

          {/* Jadwal Hari Ini - Hanya tampil di tab Absent */}
          {activeTab === "Absent" && (
            <div className="bg-white p-4 rounded-lg shadow-md border border-blue-100">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <FaCalendarAlt className="text-blue-500" />
                Jadwal Hari Ini
              </h3>
              <div className="space-y-3">
                {(() => {
                  const offset = 7;
                  const localDate = new Date(
                    new Date().getTime() + offset * 60 * 60 * 1000
                  );
                  const today = localDate.toISOString().split("T")[0];
                  const jadwalHariIni = attendances.filter(
                    (a) => a.date === today && a.attendanceStatus === "Absent"
                  );
                  if (jadwalHariIni.length === 0) {
                    return (
                      <div className="text-gray-500 text-center py-4">
                        Tidak ada jadwal hari ini
                      </div>
                    );
                  }
                  return jadwalHariIni.map((jadwal) => (
                    <div
                      key={jadwal.id}
                      className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{jadwal.siswaName}</p>
                          <p className="text-sm text-gray-500">
                            {jadwal.dayName}, {jadwal.date} | {jadwal.time}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedJadwal(jadwal.id);
                              console.log("Selected Jadwal ID:", jadwal.id);
                              setOpenPresentModal(true);
                            }}
                            className="p-2 text-green-600 hover:bg-green-100 rounded-lg"
                            title="Catat Kehadiran"
                          >
                            <FaCheckCircle size={20} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedJadwal(jadwal.id);
                              setOpenRescheduleModal(true);
                            }}
                            className="p-2 text-orange-600 hover:bg-orange-100 rounded-lg"
                            title="Ajukan Reschedule"
                          >
                            <FaCalendarAlt size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          )}
          {/*  Data Table */}
          {loading ? (
            <div className="text-center py-8 text-gray-500">Memuat data...</div>
          ) : (
            <DataTable
              data={filteredAttendances}
              columns={columns}
              onSearch={true}
              filterOptions={{
                title: `Kehadiran - ${
            activeTab === "Absent"
              ? "Belum hadir"
              : activeTab === "Present"
              ? "Hadiir"
              : activeTab === "RescheduleRequest"
              ? "Request Ganti Tentor"
              : "Menunggu konfirmasi hadir"
                }`,
                description: `Kelola data kehadiran ${
            activeTab === "Absent"
              ? "yang belum tercatat"
              : activeTab === "Present"
              ? "yang sudah hadir"
              : activeTab === "RescheduleRequest"
              ? "permintaan ganti tentor"
              : "menunggu konfirmasi hadir"
                }`,
                filters: [],
              }}
              paginationOptions={{
                pageIndex: 0,
                pageSize: 10,
              }}
            />
          )}

          {/* Modals */}
        <PresentModal
          open={openPresentModal}
          onClose={() => setOpenPresentModal(false)}
          jadwalId={selectedJadwal}
          refreshData={() => {
            const fetchData = async () => {
              const token = Cookies.get("token");
              const { data } = await axios.get(
                `${API}/jadwal/tentor/${user.id}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );
              setAttendances(data);
            };
            fetchData();
          }}
        
        />

        <RescheduleModal
          open={openRescheduleModal}
          onClose={() => setOpenRescheduleModal(false)}
          jadwalId={selectedJadwal}
          refreshData={() => {
            const fetchData = async () => {
              const token = Cookies.get("token");
              const { data } = await axios.get(
                `${API}/jadwal/tentor/${user.id}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );
              setAttendances(data);
            };
            fetchData();
          }}
        />
      </div>
    </DashboardLayout>
  );
}
