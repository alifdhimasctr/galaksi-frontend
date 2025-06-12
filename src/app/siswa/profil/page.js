"use client";
import DashboardLayout from "@/app/component/dashboardLayout";
import React, { useState, useEffect } from "react";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
import Cookies from "js-cookie";
const user = JSON.parse(Cookies.get("user") || "{}");

const ProfileSiswa = () => {
  const [siswa, setSiswa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Simulasi ID siswa dari URL parameter
  const siswaId = user.id

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = Cookies.get("token");
        const response = await fetch(`${API}/users/siswa/${siswaId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            });
        if (!response.ok) {
          throw new Error("Gagal memuat data siswa");
        }
        const data = await response.json();
        setSiswa(data);
        setLoading(false);
      } catch (err) {
        setError("Gagal memuat data siswa");
        setLoading(false);
      }
    };

    fetchData();
  }, [siswaId]);

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
            <p className="mt-4 text-gray-600">Memuat profil siswa...</p>
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
              

              <div className="mt-4 md:mt-0 text-center md:text-left">
                <h1 className="text-2xl font-bold">{siswa.name}</h1>
                <p className="text-blue-100 mt-1">@{siswa.username}</p>

                <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-3">
                  <div className="bg-blue-500 bg-opacity-30 px-3 py-1 rounded-full text-sm">
                    ID: {siswa.id}
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-sm ${
                      siswa.status === "active"
                        ? "bg-green-500 bg-opacity-30 text-green-100"
                        : "bg-red-500 bg-opacity-30 text-red-100"
                    }`}
                  >
                    {siswa.status === "active" ? "Aktif" : "Nonaktif"}
                  </div>
                  <div className="bg-purple-500 bg-opacity-30 px-3 py-1 rounded-full text-sm">
                    {siswa.level}
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
                    <p className="font-medium">{siswa.email}</p>
                  </div>

                  <div>
                    <h3 className="text-sm text-gray-500">Nomor Telepon</h3>
                    <p className="font-medium">{siswa.noHp}</p>
                  </div>

                  <div>
                    <h3 className="text-sm text-gray-500">Jenis Kelamin</h3>
                    <p className="font-medium">
                      {siswa.gender === "L" ? "Laki-laki" : "Perempuan"}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm text-gray-500">Kota</h3>
                    <p className="font-medium">{siswa.city}</p>
                  </div>

                  <div>
                    <h3 className="text-sm text-gray-500">Tujuan Belajar</h3>
                    <p className="font-medium capitalize">{siswa.purpose}</p>
                  </div>
                </div>
              </div>

              {/* Kolom Kanan - Informasi Lainnya */}
              <div className="space-y-6">
                {/* Informasi Orang Tua */}
                <div className="bg-gray-50 p-5 rounded-lg">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
                    Informasi Orang Tua
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm text-gray-500">Nama Orang Tua</h3>
                      <p className="font-medium">{siswa.parentName}</p>
                    </div>

                    <div>
                      <h3 className="text-sm text-gray-500">Pekerjaan</h3>
                      <p className="font-medium">{siswa.parentJob}</p>
                    </div>
                  </div>
                </div>

                {/* Informasi Akun */}
                <div className="bg-gray-50 p-5 rounded-lg">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
                    Informasi Akun
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm text-gray-500">
                        Tanggal Bergabung
                      </h3>
                      <p className="font-medium">
                        {formatDate(siswa.dateJoin)}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm text-gray-500">Saldo Wallet</h3>
                      <p className="font-medium text-blue-600">
                        {formatCurrency(siswa.wallet)}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm text-gray-500">
                        Status Pembelian Pertama
                      </h3>
                      <p className="font-medium">
                        {siswa.isFirstPurchase
                          ? "Sudah melakukan pembelian"
                          : "Belum melakukan pembelian"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Alamat Lengkap */}
            <div className="mt-6 bg-gray-50 p-5 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
                Alamat Lengkap
              </h2>
              <p className="text-gray-700">{siswa.address}</p>
            </div>

            {/* Informasi Mitra */}
            <div className="mt-6 bg-blue-50 border border-blue-100 p-5 rounded-lg">
              <h2 className="text-lg font-semibold text-blue-800 mb-3">
                Mitra
              </h2>
              <div className="flex items-center">
                <div className="bg-blue-200 rounded-lg w-12 h-12 flex items-center justify-center mr-4">
                  <span className="text-blue-800 font-bold">M</span>
                </div>
                <div>
                  <p className="font-medium">{siswa.mitraName}</p>
                  <p className="text-sm text-blue-600">
                    ID Mitra: {siswa.mitraId}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-gray-500 mb-2 md:mb-0">
                Terdaftar sejak: {formatDate(siswa.createdAt)}
              </p>
              <p className="text-sm text-gray-500">
                Terakhir diperbarui: {formatDate(siswa.updatedAt)}
              </p>
            </div>
          </div>


    </DashboardLayout>
  );
};

export default ProfileSiswa;
