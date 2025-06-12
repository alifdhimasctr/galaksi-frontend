// app/transactions/page.js
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import DashboardLayout from "@/app/component/dashboardLayout";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const TransactionsPage = () => {
  const [dataType, setDataType] = useState("summary"); // 'income', 'expenses', 'summary'
  const [period, setPeriod] = useState("month"); // 'day', 'week', 'month', 'custom'
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [incomeData, setIncomeData] = useState({ transactions: [], total: 0 });
  const [expensesData, setExpensesData] = useState({ 
    honor: [], 
    proshare: [], 
    totalHonor: 0, 
    totalProshare: 0 
  });
  const [summaryData, setSummaryData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expenseTab, setExpenseTab] = useState("honor"); // 'honor', 'proshare'

  // Inisialisasi tanggal default
  useEffect(() => {
    const today = new Date();
    setEndDate(today);
    
    if (period === "day") {
      setStartDate(today);
    } else if (period === "week") {
      const start = new Date(today);
      start.setDate(today.getDate() - today.getDay());
      setStartDate(start);
    } else if (period === "month") {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      setStartDate(start);
    }
  }, [period]);

  // Format tanggal untuk query
  const formatDate = (date) => {
    return date.toISOString().split("T")[0];
  };

  // Fetch data dari API
  const fetchData = async () => {
    if (!startDate || !endDate) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const token = Cookies.get("token");
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
      const params = {
        start: formatDate(startDate),
        end: formatDate(endDate),
      };

      // Jika bukan custom period, gunakan parameter period
      if (period !== "custom") {
        params.period = period;
      }

      // Ambil semua data sekaligus untuk efisiensi
      const [incomeRes, expensesRes, summaryRes] = await Promise.all([
        axios.get(`${baseUrl}/transactions/income`, {
          params,
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${baseUrl}/transactions/expenses`, {
          params,
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${baseUrl}/transactions/summary`, {
          params,
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setIncomeData(incomeRes?.data || { transactions: [], total: 0 });
      setExpensesData(expensesRes?.data || { 
        honor: [], 
        proshare: [], 
        totalHonor: 0, 
        totalProshare: 0 
      });
      setSummaryData(summaryRes.data || {});
    } catch (err) {
      setError("Gagal memuat data transaksi: " + (err.response?.data?.message || err.message));
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data saat parameter berubah
  useEffect(() => {
    if (startDate && endDate) {
      fetchData();
    }
  }, [startDate, endDate]);

  // Format uang
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Data untuk grafik ringkasan
  const summaryChartData = [
    { name: "Pemasukan", value: summaryData.income?.total || 0 },
    { name: "Pengeluaran", value: summaryData.expenses?.total || 0 },
    { name: "Pendapatan Bersih", value: summaryData.netIncome || 0 },
  ];

  // Data untuk grafik pemasukan per hari
  const incomeChartData = incomeData.transactions?.reduce((acc, transaction) => {
    if (!transaction?.paymentDate) return acc;
    const date = transaction.paymentDate.split(" ")[0];
    if (!acc[date]) {
      acc[date] = 0;
    }
    acc[date] += transaction.price || 0;
    return acc;
  }, {});

  const incomeChartDataArray = Object.keys(incomeChartData || {})
    .map((date) => ({
      date,
      amount: incomeChartData[date],
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // Data untuk grafik pengeluaran per jenis
  const expensesChartData = [
    { name: "Honor", value: expensesData.totalHonor || 0 },
    { name: "Proshare", value: expensesData.totalProshare || 0 },
  ];

  // Render grafik berdasarkan jenis data
  const renderChart = () => {
    if (loading) {
      return (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (error) {
      return <p className="text-red-500 text-center py-10">{error}</p>;
    }

    switch (dataType) {
      case "income":
        return (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incomeChartDataArray}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(value) => formatCurrency(value).replace("Rp", "")} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="amount" name="Pemasukan" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      case "expenses":
        return (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expensesChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {expensesChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        );
      case "summary":
      default:
        return (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summaryChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => formatCurrency(value).replace("Rp", "")} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
    }
  };

  // Render tabel berdasarkan jenis data
  const renderTable = () => {
    if (loading) {
      return (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 rounded animate-pulse"></div>
          ))}
        </div>
      );
    }

    if (error) {
      return <p className="text-red-500 text-center py-5">{error}</p>;
    }

    switch (dataType) {
      case "income":
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Siswa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mitra
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jumlah
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {incomeData.transactions?.length > 0 ? (
                  incomeData.transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {transaction.paymentDate 
                          ? new Date(transaction.paymentDate).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {transaction.siswa?.name || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {transaction.mitra?.name || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {formatCurrency(transaction.price)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                      Tidak ada data pemasukan
                    </td>
                  </tr>
                )}
                <tr className="bg-gray-50 font-bold">
                  <td colSpan="3" className="px-6 py-4 text-right">
                    Total Pemasukan:
                  </td>
                  <td className="px-6 py-4 text-right">
                    {formatCurrency(incomeData.total || 0)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        );
      case "expenses":
        return (
          <div>
            <div className="flex mb-4">
              <button
                className={`px-4 py-2 rounded-l-lg ${
                  expenseTab === "honor"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
                onClick={() => setExpenseTab("honor")}
              >
                Honor
              </button>
              <button
                className={`px-4 py-2 rounded-r-lg ${
                  expenseTab === "proshare"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
                onClick={() => setExpenseTab("proshare")}
              >
                Proshare
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {expenseTab === "honor" ? "Tentor" : "Mitra"}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jumlah
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {expenseTab === "honor" ? (
                    expensesData.honor?.length > 0 ? (
                      expensesData.honor.map((expense) => (
                        <tr key={expense.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {expense.paymentDate 
                              ? new Date(expense.paymentDate).toLocaleDateString()
                              : "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {expense.tentor?.name || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            {formatCurrency(expense.total)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                          Tidak ada data honor
                        </td>
                      </tr>
                    )
                  ) : expensesData.proshare?.length > 0 ? (
                    expensesData.proshare.map((expense) => (
                      <tr key={expense.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {expense.paymentDate 
                            ? new Date(expense.paymentDate).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {expense.mitra?.name || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          {formatCurrency(expense.total)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                        Tidak ada data proshare
                      </td>
                    </tr>
                  )}
                  <tr className="bg-gray-50 font-bold">
                    <td colSpan="2" className="px-6 py-4 text-right">
                      Total {expenseTab === "honor" ? "Honor" : "Proshare"}:
                    </td>
                    <td className="px-6 py-4 text-right">
                      {formatCurrency(
                        expenseTab === "honor"
                          ? expensesData.totalHonor || 0
                          : expensesData.totalProshare || 0
                      )}
                    </td>
                  </tr>
                  <tr className="bg-gray-100 font-bold">
                    <td colSpan="2" className="px-6 py-4 text-right">
                      Total Pengeluaran:
                    </td>
                    <td className="px-6 py-4 text-right">
                      {formatCurrency(
                        (expensesData.totalHonor || 0) + 
                        (expensesData.totalProshare || 0)
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      case "summary":
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm uppercase opacity-90">Total Pemasukan</p>
                  <p className="text-2xl font-bold mt-1">
                    {formatCurrency(summaryData.income?.total || 0)}
                  </p>
                </div>
                <div className="bg-white/20 rounded-lg p-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="mt-4 text-sm opacity-90">
                {incomeData.transactions?.length || 0} transaksi pemasukan
              </div>
            </div>

            <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm uppercase opacity-90">Total Pengeluaran</p>
                  <p className="text-2xl font-bold mt-1">
                    {formatCurrency(
                      (expensesData.totalHonor || 0) + 
                      (expensesData.totalProshare || 0)
                    )}
                  </p>
                </div>
                <div className="bg-white/20 rounded-lg p-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="mt-4 text-sm opacity-90">
                {expensesData.honor?.length + expensesData.proshare?.length || 0} transaksi pengeluaran
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm uppercase opacity-90">Pendapatan Bersih</p>
                  <p className="text-2xl font-bold mt-1">
                    {formatCurrency(summaryData.netIncome || 0)}
                  </p>
                </div>
                <div className="bg-white/20 rounded-lg p-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
              </div>
              <div className="mt-4 text-sm opacity-90">
                Laba periode terpilih
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Laporan Transaksi</h1>

        {/* Filter Section */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jenis Data
                </label>
                <div className="flex space-x-2">
                  <button
                    className={`px-4 py-2 rounded-lg ${
                      dataType === "summary"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                    onClick={() => setDataType("summary")}
                  >
                    Ringkasan
                  </button>
                  <button
                    className={`px-4 py-2 rounded-lg ${
                      dataType === "income"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                    onClick={() => setDataType("income")}
                  >
                    Pemasukan
                  </button>
                  <button
                    className={`px-4 py-2 rounded-lg ${
                      dataType === "expenses"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                    onClick={() => setDataType("expenses")}
                  >
                    Pengeluaran
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Periode
                </label>
                <div className="flex space-x-2">
                  <button
                    className={`px-3 py-2 rounded-lg ${
                      period === "day"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                    onClick={() => setPeriod("day")}
                  >
                    Hari Ini
                  </button>
                  <button
                    className={`px-3 py-2 rounded-lg ${
                      period === "week"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                    onClick={() => setPeriod("week")}
                  >
                    Minggu Ini
                  </button>
                  <button
                    className={`px-3 py-2 rounded-lg ${
                      period === "month"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                    onClick={() => setPeriod("month")}
                  >
                    Bulan Ini
                  </button>
                  <button
                    className={`px-3 py-2 rounded-lg ${
                      period === "custom"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                    onClick={() => setPeriod("custom")}
                  >
                    Custom
                  </button>
                </div>
              </div>
            </div>

            {period === "custom" && (
              <div className="flex space-x-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dari Tanggal
                  </label>
                  <DatePicker
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                    className="border rounded-lg px-3 py-2 w-full"
                    dateFormat="dd/MM/yyyy"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sampai Tanggal
                  </label>
                  <DatePicker
                    selected={endDate}
                    onChange={(date) => setEndDate(date)}
                    selectsEnd
                    startDate={startDate}
                    endDate={endDate}
                    minDate={startDate}
                    className="border rounded-lg px-3 py-2 w-full"
                    dateFormat="dd/MM/yyyy"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Grafik Section */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {dataType === "income"
              ? "Grafik Pemasukan"
              : dataType === "expenses"
              ? "Grafik Pengeluaran"
              : "Ringkasan Keuangan"}
          </h2>
          {renderChart()}
        </div>

        {/* Tabel Section */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <h2 className="text-xl font-semibold mb-4">
            {dataType === "income"
              ? "Detail Pemasukan"
              : dataType === "expenses"
              ? "Detail Pengeluaran"
              : "Statistik Keuangan"}
          </h2>
          {renderTable()}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TransactionsPage;