"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import DashboardLayout from "@/app/component/dashboardLayout";
import {
  FaGraduationCap,
  FaVenus,
  FaMars,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaSearch,
  FaBook,
  FaFilter,
} from "react-icons/fa";

export default function TentorDatabase() {
  const [tentors, setTentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLevel, setFilterLevel] = useState("all");
  const [siswaData, setSiswaData] = useState(null);

  const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
  const user = Cookies.get("user") ? JSON.parse(Cookies.get("user")) : null;

  useEffect(() => {
    async function fetchTentors() {
      try {
        const token = Cookies.get("token");

        // Fetch tentors
        const tentorResponse = await axios.get(
          `${API}/tentor/level/${user.level}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Fetch siswa data
        const siswaResponse = await axios.get(`${API}/users/siswa/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }); 
        setSiswaData(siswaResponse.data);
        

        // Fetch mapel
        const mapelResponse = await axios.get(`${API}/mapel`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const mapelData = mapelResponse.data.reduce((acc, mapel) => {
          acc[mapel.id] = mapel.name;
          return acc;
        }, {});

        // Process tentors
        const processedTentors = tentorResponse.data.map((tentor) => ({
          ...tentor,
          level: JSON.parse(tentor.level),
          mapel: JSON.parse(tentor.mapel || "[]").map(
            (mapelId) => mapelData[mapelId] || "Unknown"
          ),
        }));

        setTentors(processedTentors);
      } catch (err) {
        setError("Gagal memuat data tentor. Silakan coba lagi.");
        console.error("Error fetching tentors or mapel:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchTentors();
  }, []);

  // Filter kota berdasarkan siswa data
  const [cityFilter, setCityFilter] = useState("");

  useEffect(() => {
    if (siswaData?.city) {
      setCityFilter(siswaData.city);
    }
  }, [siswaData]);
  


  // Ambil daftar kota unik dari tentors
  const cityOptions = Array.from(new Set(tentors.map((t) => t.city))).filter(
    Boolean
  );

  // Filter tentor berdasarkan pencarian, level, dan kota
  const filteredTentors = tentors.filter((tentor) => {
    const matchesSearch =
      tentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tentor.university.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel =
      filterLevel === "all" || tentor.level.includes(filterLevel);
    const matchesCity = !cityFilter || tentor.city === cityFilter;
    return matchesSearch && matchesLevel && matchesCity;
  });

  const levels = ["TK", "SD", "SMP", "SMA"];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Database Tentor
              </h1>
              <p className="text-gray-600 mt-1">
                Temukan tentor berpengalaman yang siap membimbing Anda
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-blue-50 rounded-lg p-3">
                <FaGraduationCap className="text-blue-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Tentor</p>
                <p className="font-bold text-gray-800">
                  {filteredTentors.length} Tentor
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter dan Pencarian */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Cari nama tentor atau universitas..."
                className="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {/* Filter Kota */}
            <div>
              <select
                className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
              >
                <option value="">Semua Kota</option>
                {cityOptions.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Daftar Tentor */}
        {loading ? (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
            <p className="mt-4 text-gray-600">Memuat data tentor...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="text-red-500 text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 mx-auto mb-3"
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
              <h3 className="text-lg font-medium mb-2">Gagal Memuat Data</h3>
              <p>{error}</p>
            </div>
          </div>
        ) : filteredTentors.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Tidak ada tentor yang ditemukan
            </h3>
            <p className="text-gray-500">
              Coba kata kunci pencarian berbeda atau filter level lain
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTentors.map((tentor) => (
              <TentorCard key={tentor.id} tentor={tentor} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function TentorCard({ tentor }) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      {/* Header dengan background gradient */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
        <div className="flex items-center">
          {/* Foto Tentor */}
          <div className="relative">
            <img
              src={tentor.fotoUrl || "https://via.placeholder.com/100"}
              alt={tentor.name}
              className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-md"
            />
            <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow">
              {tentor.gender === "L" ? (
                <div className="bg-blue-500 rounded-full p-1">
                  <FaMars className="text-white text-xs" />
                </div>
              ) : (
                <div className="bg-pink-500 rounded-full p-1">
                  <FaVenus className="text-white text-xs" />
                </div>
              )}
            </div>
          </div>

          {/* Nama dan Status */}
          <div className="ml-4">
            <h2 className="text-lg font-bold text-white">{tentor.name}</h2>
            <div className="mt-1 flex items-center">
              <div
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  tentor.status === "active"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {tentor.status === "active" ? "Aktif" : "Nonaktif"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Tentor */}
      <div className="p-6">
        <div className="mb-4">
          <div className="flex items-center mb-2 text-gray-700">
            <FaGraduationCap className="text-blue-600 mr-2" />
            <span className="font-medium">{tentor.university}</span>
          </div>
          <div className="flex items-center text-gray-600 ml-6">
            <FaBook className="text-blue-600 mr-2" />
            <span>{tentor.faculty}</span>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="font-medium text-gray-700 mb-2 flex items-center">
            <FaMapMarkerAlt className="text-blue-600 mr-2" />
            Domisili
          </h3>
          <p className="text-gray-600 ml-6">{tentor.city}</p>
        </div>

        <div className="mb-4">
          <h3 className="font-medium text-gray-700 mb-2">Mengajar Level</h3>
          <div className="flex flex-wrap gap-2 ml-1">
            {tentor.level.map((level) => (
              <span
                key={level}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
              >
                {level}
              </span>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <h3 className="font-medium text-gray-700 mb-2">
            Mata Pelajaran yang dikuasai
          </h3>
          <div className="flex flex-wrap gap-2 ml-1">
            {tentor.mapel.map((mapel, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium"
              >
                {mapel}
              </span>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <h3 className="font-medium text-gray-700 mb-2">Kontak</h3>
          <div className="space-y-2">
            <div className="flex items-center text-gray-600">
              <FaPhone className="text-blue-600 mr-2" />
              <span>{tentor.noHp}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <FaEnvelope className="text-blue-600 mr-2" />
              <span className="truncate">{tentor.email}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-6 py-3 text-center">
        <p className="text-xs text-gray-500">
          Bergabung sejak{" "}
          {new Date(tentor.dateJoin).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>
    </div>
  );
}
