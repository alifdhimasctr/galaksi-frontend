"use client";
import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";
import {
  FaBars,
  FaChevronLeft,
  FaChevronRight,
  FaTachometerAlt,
  FaUserFriends,
  FaChalkboardTeacher,
  FaHandshake,
  FaMoneyBillWave,
  FaWallet,
  FaClipboardList,
  FaBook,
  FaSignOutAlt,
  FaUsers,
  FaGraduationCap,
  FaBuilding,
  FaExchangeAlt,
  FaBookOpen,
  FaList,
} from "react-icons/fa";

const BLUE = "text-blue-400";
const GOLD = "text-yellow-400";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState("dashboard");
  const [showText, setShowText] = useState(true); // delay label

  useEffect(() => {
    const raw = Cookies.get("user");
    if (!raw) return router.replace("/login");
    try {
      setUser(JSON.parse(raw));
    } catch {
      router.replace("/login");
    }
  }, [router]);

  /* ---------------- MENU DATA ---------------- */
  const menus = {
    admin: [
      {
        label: "Dashboard",
        link: "/admin/dashboard",
        icon: <FaTachometerAlt />,
      },
      {
        label: "Siswa",
        icon: <FaUsers />,
        children: [
          { label: "Database", link: "/admin/siswa/database"},
          { label: "Presensi", link: "/admin/siswa/presensi"},
          { label: "Invoice", link: "/admin/siswa/invoice"},
          { label: "Pendaftaran Siswa", link: "/admin/siswa/paket"},
        ],
      },
      {
        label: "Tentor",
        icon: <FaGraduationCap />,
        children: [
          { label: "Database", link: "/admin/tentor/database" },
          { label: "Presensi", link: "/admin/tentor/presensi" },
          { label: "Honor", link: "/admin/tentor/honor" },
        ],
      },
      {
        label: "Mitra",
        icon: <FaBuilding />,
        children: [
          { label: "Database", link: "/admin/mitra/database" },
          { label: "Profit Sharing", link: "/admin/mitra/proshare" },
        ],
      },
      {
        label: "Paket",
        icon: <FaBookOpen />,
        link: "/admin/paket",
      },
      {
        label: "Mapel",
        icon: <FaBook />,
        link: "/admin/mapel",
      },
      {
        label: "Transaksi",
        icon: <FaExchangeAlt />,
        link: "/admin/transaksi",
      },
    ],
    siswa: [
      {
        label: "Paket",
        link: "/siswa/paket",
        icon: <FaBook />,
      },
      { label: "Jadwal Les", link: "/siswa/jadwal", icon: <FaList /> },
      {
        label: "Database Tentor",
        link: "/siswa/tentor",
        icon: <FaChalkboardTeacher />,
      },
      { label: "Invoice", link: "/siswa/invoice", icon: <FaMoneyBillWave /> },
      { label: "Profil", link: "/siswa/profil", icon: <FaUserFriends /> },
    ],
    tentor: [
      {
        label: "Presensi",
        link: "/tentor/presensi",
        icon: <FaClipboardList />,
      },
      { label: "Claim Honor", link: "/tentor/claim-honor", icon: <FaWallet /> },
      { label: "Profil", link: "/tentor/profil", icon: <FaUserFriends /> },
    ],
    mitra: [
      { label: "Database Siswa", link: "/mitra/siswa", icon: <FaBook /> },
      {
        label: "Claim Profit",
        link: "/mitra/claim-profit",
        icon: <FaWallet />,
      },
      { label: "Profil", link: "/mitra/profil", icon: <FaUserFriends /> },
    ],
  };

  const sidebarStyle = {
    width: isCollapsed ? "4.5rem" : "17rem",
    transition: mobileOpen 
      ? "transform 300ms cubic-bezier(0.4, 0, 0.2, 1), width 300ms" 
      : "width 300ms cubic-bezier(0.4, 0, 0.2, 1)",
    background: "linear-gradient(180deg, #23272f 0%, #111317 100%)",
  };

  const menuItemStyle = (isActive) => 
    `flex items-center rounded-lg mx-3 my-1 gap-3 py-3 px-3 cursor-pointer text-sm transition-all duration-200
    ${isActive 
      ? `bg-blue-900/30 text-white border-l-4 border-yellow-400 font-medium shadow-md` 
      : "text-blue-100 hover:bg-blue-800/50 hover:text-white"}
    ${!showText ? "justify-center" : ""}`;

  /* ---------------- MODIFIED COMPONENTS ---------------- */
  const MenuLink = ({ item }) => {
    const isActive = pathname === item.link;
    return (
      <Link href={item.link} onClick={() => setMobileOpen(false)}>
        <div className={menuItemStyle(isActive)}>
          <span className={`text-lg ${isActive ? GOLD : BLUE}`}>
            {item.icon}
          </span>
          {showText && (
            <span className="text-xs transition-opacity duration-200">
              {item.label}
            </span>
          )}
        </div>
      </Link>
    );
  };

  const Group = ({ group }) => {
    const isGroupActive = pathname.startsWith(`/admin/${group.label.toLowerCase()}`);
    const open = openGroup === group.label;

    return (
      <div>
        <div
          onClick={() => setOpenGroup(open ? null : group.label)}
          className={menuItemStyle(isGroupActive)}
        >
          <span className={`text-lg ${isGroupActive ? GOLD : BLUE}`}>
            {group.icon}
          </span>
          {showText && (
            <>
              <span className="text-xs flex-1">{group.label}</span>
              <FaChevronRight
                className={`transform transition-transform ${
                  open ? "rotate-90" : "rotate-0"
                } text-xs ${isGroupActive ? "text-yellow-400" : "text-blue-300"}`}
              />
            </>
          )}
        </div>
        
        <div
          className={`ml-4 transition-all duration-200 overflow-hidden ${
            open && !isCollapsed ? "max-h-96" : "max-h-0"
          }`}
        >
          {group.children.map((c) => (
            <MenuLink key={c.link} item={c} />
          ))}
        </div>
      </div>
    );
  };

  if (!user) return null;

  const toggleCollapse = () => {
    if (!isCollapsed) {
      setShowText(false);
      setIsCollapsed(true);
    } else {
      setIsCollapsed(false);
      setTimeout(() => setShowText(true), 100);
    }
  };

  /* ------------- COMPONENT ------------- */
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Enhanced Sidebar - Blue Gradient */}
      <aside
        className={`shadow-lg z-50 fixed md:relative inset-y-0 left-0
          transform transition-all duration-300 ease-in-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
        style={sidebarStyle}
      >
        {/* Improved Header */}
        <div className="flex items-center justify-between p-4 border-b border-blue-700 h-14">
          {!isCollapsed && (
            <h1 className="text-sm font-semibold text-white truncate">
              {user?.name}
              <span className="block text-xs font-normal text-blue-200 capitalize">
                {user?.role}
              </span>
            </h1>
          )}
          <button
            onClick={toggleCollapse}
            className="p-2 rounded-md hover:bg-blue-800/50 transition-colors text-blue-200 hover:text-yellow-400"
          >
            {isCollapsed ? (
              <FaChevronRight className="text-lg" />
            ) : (
              <FaChevronLeft className="text-lg" />
            )}
          </button>
        </div>

        {/* Enhanced Navigation */}
        <nav className="pb-8 overflow-y-auto">
          {menus[user.role].map((m) =>
            m.children ? (
              <Group key={m.label} group={m} />
            ) : (
              <MenuLink key={m.link} item={m} />
            )
          )}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Improved Topbar - Solid Blue */}
        <header className="flex items-center justify-between bg-gradient-to-r from-blue-800 to-blue-700 shadow-md px-6 py-3 h-14">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-blue-900/30 text-white hover:text-yellow-400"
          >
            <FaBars className="text-lg" />
          </button>
          
          <h1 className="text-lg font-semibold text-white capitalize">
            {pathname.split("/").slice(-1)[0].replace(/-/g, " ")}
          </h1>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-medium text-white">
                {user.role === "admin" ? user.username : user.name}
              </span>
              <span className="text-xs text-blue-200 capitalize">
                {user.role}
              </span>
            </div>
            <button
              onClick={() => {
                Cookies.remove("user");
                Cookies.remove("token");
                router.replace("/login");
              }}
              className="p-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 transition-colors text-white"
            >
              <FaSignOutAlt className="text-lg" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto bg-gradient-to-br from-gray-50 to-blue-50">
          {children}
        </main>
      </div>
    </div>
  );
}