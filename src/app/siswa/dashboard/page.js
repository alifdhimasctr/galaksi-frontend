"use client";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "@/app/component/dashboardLayout";

export default function SiswaDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);


  const handleLogout = () => {
    Cookies.remove("user");
    Cookies.remove("token");
    toast.success("Logged out");
    router.replace("/login");
  };

  return (
    <DashboardLayout>
        Hai
    </DashboardLayout>
  );
}