"use client";
import DashboardLayout from "@/app/component/dashboardLayout";
import React, { useState, useEffect } from "react";
import OrderPage from "./orderPage";
import axios from "axios";
import Cookies from "js-cookie";
import {
  FaIdBadge,
  FaCube,
  FaBook,
  FaCalendarAlt,
  FaUserTie,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
} from "react-icons/fa";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
const user  = JSON.parse(Cookies.get("user") || "{}");




const StatusBadge = ({ status }) => {
  const statusStyle =
    {
      Approve: "bg-green-100 text-green-700",
      NonApprove: "bg-red-100 text-red-700",
      Pending: "bg-yellow-100 text-yellow-700",
    }[status] || "bg-gray-100 text-gray-700";

  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-medium ${statusStyle}`}
    >
      {status}
    </span>
  );
};

const OrderCard = ({ order }) => {
  
  const getStatusStyle = (status) => {
    switch (status) {
      case "Approve":
        return "border-green-200 bg-green-50";
      case "NonApprove":
        return "border-red-200 bg-red-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  return (
    <div
      className={`border rounded-lg p-6 mb-6 shadow-md hover:shadow-lg transition-shadow ${getStatusStyle(
        order.status
      )}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FaIdBadge className="text-blue-500" />
          <h3 className="text-lg font-semibold">Order ID: {order.id}</h3>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="flex items-start gap-3">
          <FaCube className="mt-1 text-purple-500" />
          <div>
            <p className="text-sm text-gray-500">Paket</p>
            <p className="font-medium">{order.paket?.name || "N/A"}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <FaUserTie className="mt-1 text-green-500" />
          <div>
            <p className="text-sm text-gray-500">Tentor</p>
            <p className="font-medium">{order.tentor?.name || "N/A"}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <FaCalendarAlt className="mt-1 text-red-500" />
          <div>
            <p className="text-sm text-gray-500">Hari Pertemuan</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {order.meetingDay?.map((day, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs"
                >
                  {day}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3">
        <FaBook className="mt-1 text-orange-500" />
        <div>
          <p className="text-sm text-gray-500">Mata Pelajaran</p>
          <div className="flex flex-wrap gap-2 mt-1">
            {order.mapel?.map((m, index) => ( // Tambahkan ? untuk optional chaining
              <span
                key={index}
                className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs"
              >
                {m?.name || 'N/A'}
              </span>
            ))}
          </div>
        </div>
      </div>

        <div className="flex items-start gap-3">
          <FaClock className="mt-1 text-yellow-500" />
          <div>
            <p className="text-sm text-gray-500">Waktu</p>
            <p className="font-medium">{order.time}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <FaCheckCircle className="mt-1 text-green-500" />
          <div>
            <p className="text-sm text-gray-500">Tanggal Pembuatan</p>
            <p className="font-medium">
              {new Date(order.createdAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function PaketPage() {
  const [orderData, setOrderData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openOrderModal, setOpenOrderModal] = useState(false);
  const [modalKey, setModalKey] = useState(Date.now());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = Cookies.get("user") ? JSON.parse(Cookies.get("user")) : null;
        const token = Cookies.get("token");
        const { data } = await axios.get(`${API}/order/siswa/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Pastikan data adalah array dan memiliki ID unik
        const ordersWithUniqueIds = data.map(order => ({
          ...order,
          // Jika order.id tidak ada, buat ID fallback
          id: order.id || `temp-${Math.random().toString(36).substr(2, 9)}`
        }));
        setOrderData(ordersWithUniqueIds);
      } catch (err) {
        setOrderData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.id]);



  return (
    <DashboardLayout>
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Daftar Pesanan</h1>
          <p className="mt-2 text-sm text-gray-500">
            Riwayat semua paket bimbingan yang pernah Anda pesan
          </p>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={`skeleton-${i}`} className="h-32 bg-gray-100 rounded-lg" />
            ))}
          </div>
        ) : orderData.length === 0 ? (
          <div className="text-center py-12">
            <div className="mb-4 text-gray-400">
              <FaCube className="mx-auto h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              Belum ada pesanan
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Silahkan memilih paket bimbingan terlebih dahulu
            </p>
            <button
              onClick={() => setOpenOrderModal(true)}
              className="mt-4 cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Pesan Paket
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orderData.map((order) => (
              <OrderCard 
                key={`order-${order.id}`} // Tambahkan prefix untuk memastikan unik
                order={order} 
              />
            ))}
          </div>
        )}

<OrderPage
          key={`modal-${modalKey}`}
          open={openOrderModal}
          onClose={() => {
            setOpenOrderModal(false);
            setModalKey(Date.now());
          }}
          onSuccess={() => {
            const user = Cookies.get("user") ? JSON.parse(Cookies.get("user")) : null;
            setOpenOrderModal(false);
            axios 
              .get(`${API}/order/siswa/${user.id}`, {
                headers: { Authorization: `Bearer ${Cookies.get("token")}` },
              })
              .then((res) => {
                setOrderData(res.data);
              });
          }}
          
        />
      </div>
    </DashboardLayout>
  );
}
  