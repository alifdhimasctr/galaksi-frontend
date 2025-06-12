"use client";
import DashboardLayout from "@/app/component/dashboardLayout";
import React, { useState, useEffect } from "react";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
import Cookies from "js-cookie";
const user = JSON.parse(Cookies.get("user") || "{}");

const ProfileTentor = () => {
  const [tentor, setTentor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const tentorId = user.id;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = Cookies.get("token");
        const response = await fetch(`${API}/users/tentor/${tentorId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error("Gagal memuat data tentor");
        }
        const data = await response.json();
        setTentor(data);
        setLoading(false);
      } catch (err) {
        setError("Gagal memuat data tentor");
        setLoading(false);
      }
    };

    fetchData();
  }, [tentorId]);

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
            <p className="mt-4 text-gray-600">Memuat profil tentor...</p>
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
        <div className="flex flex-col md:flex-row items-center">
          {/* Foto Profil */}
          <div className="mr-6">
            {tentor.fotoUrl ? (
              <img
                src={tentor.fotoUrl}
                alt="Foto Profil"
                className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
              />
            ) : (
              <div className="bg-gray-200 border-2 border-dashed rounded-full w-24 h-24 flex items-center justify-center text-gray-500">
                No Photo
              </div>
            )}
          </div>

          <div className="mt-4 md:mt-0 text-center md:text-left">
            <h1 className="text-2xl font-bold">{tentor.name}</h1>
            <p className="text-blue-100 mt-1">@{tentor.username}</p>

            <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-3">
              <div className="bg-blue-500 bg-opacity-30 px-3 py-1 rounded-full text-sm">
                ID: {tentor.id}
              </div>
              <div
                className={`px-3 py-1 rounded-full text-sm ${
                  tentor.status === "active"
                    ? "bg-green-500 bg-opacity-30 text-green-100"
                    : "bg-red-500 bg-opacity-30 text-red-100"
                }`}
              >
                {tentor.status === "active" ? "Aktif" : "Nonaktif"}
              </div>
              <div className="bg-purple-500 bg-opacity-30 px-3 py-1 rounded-full text-sm">
                {tentor.level.join(", ")}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Informasi Utama */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Kolom Kiri - Informasi Pribadi */}
          <div className="bg-gray-50 p-5 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
              Informasi Pribadi
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm text-gray-500">Email</h3>
                <p className="font-medium">{tentor.email}</p>
              </div>

              <div>
                <h3 className="text-sm text-gray-500">Nomor Telepon</h3>
                <p className="font-medium">{tentor.noHp}</p>
              </div>

              <div>
                <h3 className="text-sm text-gray-500">Jenis Kelamin</h3>
                <p className="font-medium">
                  {tentor.gender === "L" ? "Laki-laki" : "Perempuan"}
                </p>
              </div>

              <div>
                <h3 className="text-sm text-gray-500">Kota</h3>
                <p className="font-medium">{tentor.city}</p>
              </div>

              <div>
                <h3 className="text-sm text-gray-500">Universitas</h3>
                <p className="font-medium">{tentor.university}</p>
              </div>

              <div>
                <h3 className="text-sm text-gray-500">Fakultas</h3>
                <p className="font-medium">{tentor.faculty}</p>
              </div>
            </div>
          </div>

          {/* Kolom Kanan - Informasi Lainnya */}
          <div className="space-y-6">
            {/* Informasi Akun */}
            <div className="bg-gray-50 p-5 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
                Informasi Akun & Keuangan
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm text-gray-500">Tanggal Bergabung</h3>
                  <p className="font-medium">
                    {formatDate(tentor.dateJoin)}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm text-gray-500">Saldo Wallet</h3>
                  <p className="font-medium text-blue-600">
                    {formatCurrency(tentor.wallet)}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm text-gray-500">Bank</h3>
                  <p className="font-medium">{tentor.bankName}</p>
                </div>

                <div>
                  <h3 className="text-sm text-gray-500">Nomor Rekening</h3>
                  <p className="font-medium">{tentor.bankNumber}</p>
                </div>
              </div>
            </div>

            {/* Informasi SIM */}
            {tentor.simUrl && (
              <div className="bg-gray-50 p-5 rounded-lg">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
                  Surat Izin Mengemudi (SIM)
                </h2>
                <a
                  href={tentor.simUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Lihat Dokumen SIM
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Alamat Lengkap */}
        <div className="mt-6 bg-gray-50 p-5 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
            Alamat Lengkap
          </h2>
          <p className="text-gray-700">{tentor.address}</p>
        </div>

        {/* Informasi Mitra */}
        <div className="mt-6 bg-blue-50 border border-blue-100 p-5 rounded-lg">
          <h2 className="text-lg font-semibold text-blue-800 mb-3">Mitra</h2>
          <div className="flex items-center">
            <div className="bg-blue-200 rounded-lg w-12 h-12 flex items-center justify-center mr-4">
              <span className="text-blue-800 font-bold">M</span>
            </div>
            <div>
              <p className="font-medium">{tentor.mitra.name}</p>
              <p className="text-sm text-blue-600">
                ID Mitra: {tentor.mitra.id}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-6 py-4 border-t">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500 mb-2 md:mb-0">
            Terdaftar sejak: {formatDate(tentor.createdAt)}
          </p>
          <p className="text-sm text-gray-500">
            Terakhir diperbarui: {formatDate(tentor.updatedAt)}
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfileTentor;