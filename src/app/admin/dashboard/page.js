"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import {
  FaChalkboardTeacher,
  FaUserGraduate,
  FaHandshake,
  FaMoneyBillWave,
  FaMoneyCheckAlt,
  FaChartLine,
} from "react-icons/fa";
import DashboardLayout from "@/app/component/dashboardLayout";

const CARD_STYLE =
  "flex flex-col justify-between rounded-xl p-6 shadow-md text-white min-w-[220px] w-full";

const statsMeta = [
  {
    keyTotal: "tentorCount",
    keyActive: "tentorActiveCount",
    keyNon: "tentorNonActiveCount",
    title: "Total Tentor",
    icon: <FaChalkboardTeacher size={24} />,
    bg: "bg-gradient-to-r from-blue-500 to-blue-600",
  },
  {
    keyTotal: "siswaCount",
    keyActive: "siswaActiveCount",
    keyNon: "siswaNonActiveCount",
    title: "Total Siswa",
    icon: <FaUserGraduate size={24} />,
    bg: "bg-gradient-to-r from-orange-500 to-orange-600",
  },
  {
    keyTotal: "mitraCount",
    keyActive: "mitraActiveCount",
    keyNon: "mitraNonActiveCount",
    title: "Total Mitra",
    icon: <FaHandshake size={24} />,
    bg: "bg-gradient-to-r from-violet-500 to-violet-600",
  },
];

// New financial stats for daily overview
const financeStatsMeta = [
  {
    key: "incomeTotal",
    title: "Pemasukan Hari Ini",
    icon: <FaMoneyBillWave size={24} />,
    bg: "bg-gradient-to-r from-green-500 to-green-600",
  },
  {
    key: "expensesTotal",
    title: "Pengeluaran Hari Ini",
    icon: <FaMoneyCheckAlt size={24} />,
    bg: "bg-gradient-to-r from-red-500 to-red-600",
  },
  {
    key: "netIncome",
    title: "Pendapatan Bersih Hari Ini",
    icon: <FaChartLine size={24} />,
    bg: "bg-gradient-to-r from-purple-500 to-purple-600",
  },
];

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = Cookies.get("token");
        const res = await axios.get(
          `${
            process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000"
          }/dashboard/admin`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setData(res.data);
      } catch (err) {
        setError("Gagal memuat data dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Format currency function
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value || 0);
  };

  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard Admin</h1>


        {/* User Statistics Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Statistik Pengguna</h2>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
            {statsMeta.map((meta) => (
              <div key={meta.title} className={`${CARD_STYLE} ${meta.bg}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs uppercase mb-1 opacity-90">{meta.title}</p>
                    {loading ? (
                      <div className="h-6 w-16 bg-white/30 rounded animate-pulse" />
                    ) : (
                      <p className="text-2xl font-semibold">{data[meta.keyTotal]}</p>
                    )}
                  </div>
                  <div className="bg-white/20 rounded-lg p-2">{meta.icon}</div>
                </div>

                <div className="flex justify-between text-xs pt-4 opacity-90">
                  {loading ? (
                    <div className="h-4 w-full bg-white/30 rounded animate-pulse" />
                  ) : (
                    <>
                      <span>Aktif: {data[meta.keyActive]}</span>
                      <span>Tidak Aktif: {data[meta.keyNon]}</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Financial Overview Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Ringkasan Keuangan Hari Ini</h2>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
            {financeStatsMeta.map((meta) => (
              <div key={meta.title} className={`${CARD_STYLE} ${meta.bg}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs uppercase mb-1 opacity-90">{meta.title}</p>
                    {loading ? (
                      <div className="h-6 w-16 bg-white/30 rounded animate-pulse" />
                    ) : (
                      <p className="text-2xl font-semibold">
                        {formatCurrency(data[meta.key])}
                      </p>
                    )}
                  </div>
                  <div className="bg-white/20 rounded-lg p-2">{meta.icon}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        
      </div>
    </DashboardLayout>
  );
}