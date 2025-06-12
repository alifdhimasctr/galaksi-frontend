"use client";
import DashboardLayout from "@/app/component/dashboardLayout";
import React, { useState, useEffect } from "react";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
import Cookies from "js-cookie";

const ProfileMitra = () => {
  const [mitra, setMitra] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mengambil ID mitra dari cookies
  const mitraId = JSON.parse(Cookies.get("user") || "{}").id;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = Cookies.get("token");
        const response = await fetch(`${API}/users/mitra/${mitraId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error("Gagal memuat data mitra");
        }
        const data = await response.json();
        setMitra(data);
        setLoading(false);
      } catch (err) {
        setError("Gagal memuat data mitra");
        setLoading(false);
      }
    };

    fetchData();
  }, [mitraId]);

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat profil mitra...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-full">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md text-center">
            <div className="text-red-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <h3 className="text-lg font-medium mt-3">Gagal Memuat Data</h3>
              <p className="mt-1">{error}</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header Profil */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
        <div className="flex flex-col">
          

          <div className="">
            <h1 className="text-2xl font-bold">{mitra.name}</h1>
            <p className="text-blue-100 mt-1">@{mitra.username}</p>

            <div className="mt-4 flex flex-wrap gap-3">
              <div className="bg-blue-500 bg-opacity-30 px-3 py-1 rounded-full text-sm">
                ID: {mitra.id}
              </div>
              <div
                className={`px-3 py-1 rounded-full text-sm ${
                  mitra.status === "active"
                    ? "bg-green-500 bg-opacity-30 text-green-100"
                    : "bg-red-500 bg-opacity-30 text-red-100"
                }`}
              >
                {mitra.status === "active" ? "Aktif" : "Nonaktif"}
              </div>
              
            </div>
          </div>
        </div>
      </div>

      {/* Informasi Utama */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Kolom Kiri - Informasi Mitra */}
          <div className="bg-gray-50 p-5 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
              Informasi Mitra
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm text-gray-500">Email</h3>
                <p className="font-medium">{mitra.email}</p>
              </div>

              <div>
                <h3 className="text-sm text-gray-500">Nomor Telepon</h3>
                <p className="font-medium">{mitra.noHp}</p>
              </div>

              <div>
                <h3 className="text-sm text-gray-500">Kota</h3>
                <p className="font-medium">{mitra.city}</p>
              </div>

              <div>
                <h3 className="text-sm text-gray-500">Tanggal Bergabung</h3>
                <p className="font-medium">{formatDate(mitra.dateJoin)}</p>
              </div>
            </div>
          </div>

          {/* Kolom Kanan - Informasi Keuangan */}
          <div className="bg-gray-50 p-5 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
              Informasi Keuangan
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm text-gray-500">Saldo Wallet</h3>
                <p className="font-medium text-blue-600">
                  {formatCurrency(mitra.wallet)}
                </p>
              </div>

              <div>
                <h3 className="text-sm text-gray-500">Nama Bank</h3>
                <p className="font-medium">{mitra.bankName}</p>
              </div>

              <div>
                <h3 className="text-sm text-gray-500">Nomor Rekening</h3>
                <p className="font-medium">{mitra.bankNumber}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Alamat Lengkap */}
        <div className="mt-6 bg-gray-50 p-5 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
            Alamat Lengkap
          </h2>
          <p className="text-gray-700">{mitra.address}</p>
        </div>

        {/* Statistik Mitra */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-100 p-5 rounded-lg">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-lg w-12 h-12 flex items-center justify-center mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-blue-600">Jumlah Siswa</p>
                <p className="font-medium text-xl">{mitra.siswa.length}</p>
              </div>
            </div>
          </div>

          
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-6 py-4 border-t">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500 mb-2 md:mb-0">
            Terdaftar sejak: {formatDate(mitra.createdAt)}
          </p>
          <p className="text-sm text-gray-500">
            Terakhir diperbarui: {formatDate(mitra.updatedAt)}
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfileMitra;