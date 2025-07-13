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
      <div className="space-y-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h1 className="text-lg font-bold text-gray-800">
                Database Tentor
              </h1>
              <p className="text-gray-600 mt-1 text-sm">
                Temukan tentor berpengalaman yang siap membimbing Anda
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-blue-50 rounded-lg p-2">
                <FaGraduationCap className="text-blue-600 text-lg" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Tentor</p>
                <p className="font-bold text-gray-800 text-base">
                  {filteredTentors.length} Tentor
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter dan Pencarian */}
        <div className="bg-white rounded-xl shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
                <FaSearch className="text-gray-400 text-base" />
              </div>
              <input
                type="text"
                placeholder="Cari nama tentor atau universitas..."
                className="w-full p-2 pl-8 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {/* Filter Kota */}
            <div>
              <select
                className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
            <p className="mt-2 text-gray-600 text-sm">Memuat data tentor...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            {/* ...error content tetap, bisa perkecil font jika perlu */}
            <div className="text-red-500 text-center">
              <h3 className="text-base font-medium mb-1">Gagal Memuat Data</h3>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        ) : filteredTentors.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-1">
              Tidak ada tentor yang ditemukan
            </h3>
            <p className="text-gray-500 text-sm">
              Coba kata kunci pencarian berbeda atau filter level lain
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4">
        <div className="flex items-center">
          {/* Foto Tentor */}
          <div className="relative">
            <img
              src={tentor.fotoUrl || "https://via.placeholder.com/100"}
              alt={tentor.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
            />
            <div className="absolute bottom-0 right-0 bg-white rounded-full p-0.5 shadow">
              {tentor.gender === "L" ? (
                <div className="bg-blue-500 rounded-full p-0.5">
                  <FaMars className="text-white text-xs" />
                </div>
              ) : (
                <div className="bg-pink-500 rounded-full p-0.5">
                  <FaVenus className="text-white text-xs" />
                </div>
              )}
            </div>
          </div>
          {/* Nama dan Status */}
          <div className="ml-3">
            <h2 className="text-base font-bold text-white">{tentor.name}</h2>
            <div className="mt-0.5 flex items-center">
              <div
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
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
        <div className="p-4">
          <div className="mb-2">
            <div className="flex items-center mb-1 text-gray-700 text-sm">
          <FaGraduationCap className="text-blue-600 mr-2 text-base" />
          <span className="font-medium">{tentor.university}</span>
            </div>
            <div className="flex items-center text-gray-600 ml-6 text-xs">
          <FaBook className="text-blue-600 mr-2 text-base" />
          <span>{tentor.faculty}</span>
            </div>
          </div>

          <div className="mb-2">
            <h3 className="font-medium text-gray-700 mb-1 flex items-center text-sm">
          <FaMapMarkerAlt className="text-blue-600 mr-2 text-base" />
          Domisili
            </h3>
            <p className="text-gray-600 ml-6 text-xs">{tentor.city}</p>
          </div>

          <div className="mb-2">
            <h3 className="font-medium text-gray-700 mb-1 text-sm">Mengajar Level</h3>
            <div className="flex flex-wrap gap-1 ml-1">
          {tentor.level.map((level) => (
            <span
              key={level}
              className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
            >
              {level}
            </span>
          ))}
            </div>
          </div>

          <div className="mb-2">
            <h3 className="font-medium text-gray-700 mb-1 text-sm">
          Mata Pelajaran yang dikuasai
            </h3>
            <div className="flex flex-wrap gap-1 ml-1">
          {tentor.mapel.map((mapel, index) => (
            <span
              key={index}
              className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full text-xs font-medium"
            >
              {mapel.name }
            </span>
          ))}
            </div>
          </div>
          
          

          {tentor.cvUrl && (
            <div className="mb-2">
              <a
                href={tentor.cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-4 py-1 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition"
              >
                Lihat CV
              </a>
            </div>
          )}
          

          <div className="border-t border-gray-100 pt-2">
            <h3 className="font-medium text-gray-700 mb-1 text-sm">Kontak</h3>
            <div className="space-y-1">
          <div className="flex items-center text-gray-600 text-xs">
            <FaPhone className="text-blue-600 mr-2 text-base" />
            <span>{tentor.noHp}</span>
          </div>
          <div className="flex items-center text-gray-600 text-xs">
            <FaEnvelope className="text-blue-600 mr-2 text-base" />
            <span className="truncate">{tentor.email}</span>
          </div>
            </div>
          </div>
        </div>

        {/* Footer */}
      <div className="bg-gray-50 px-4 py-2 text-center">
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
