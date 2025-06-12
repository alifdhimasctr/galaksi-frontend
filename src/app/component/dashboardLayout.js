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

const BLUE = "text-blue-600";
const GOLD = "text-yellow-500";

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
    // MAIN label, icon, optional children
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
          { label: "Paket Siswa", link: "/admin/siswa/paket"},
          
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
  };

  const menuItemStyle = (isActive) => 
    `flex items-center rounded-lg mx-3 my-1 gap-3 py-3 px-3 cursor-pointer text-sm transition-all duration-200
    ${isActive ? `bg-blue-50 ${BLUE} font-medium` : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"}
    ${!showText ? "justify-center" : ""}`;

  /* ---------------- MODIFIED COMPONENTS ---------------- */
  const MenuLink = ({ item }) => {
    const isActive = pathname === item.link;
    return (
      <Link href={item.link} onClick={() => setMobileOpen(false)}>
        <div className={menuItemStyle(isActive)}>
          <span className="text-lg">{item.icon}</span>
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
          <span className="text-lg">{group.icon}</span>
          {showText && (
            <>
              <span className="text-xs flex-1">{group.label}</span>
              <FaChevronRight
                className={`transform transition-transform ${
                  open ? "rotate-90" : "rotate-0"
                } text-xs`}
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
      // want to collapse
      setShowText(false);
      setIsCollapsed(true);
    } else {
      // expand – wait 300ms before showing text
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

      {/* Enhanced Sidebar */}
      <aside
        className={`bg-white shadow-lg z-50 fixed md:relative inset-y-0 left-0
          transform transition-all duration-300 ease-in-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
        style={sidebarStyle}
      >
        {/* Improved Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 h-14">
          {!isCollapsed && (
            <h1 className="text-sm font-semibold text-blue-600 truncate">
              {user?.name}
            </h1>
          )}
          <button
            onClick={toggleCollapse}
            className="p-3 rounded-md hover:bg-gray-100 transition-colors"
          >
            {isCollapsed ? (
              <FaChevronRight className="text-gray-600" />
            ) : (
              <FaChevronLeft className="text-gray-600" />
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
        {/* Improved Topbar */}
        <header className="flex items-center justify-between bg-white shadow-sm px-6 py-3 h-14">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <FaBars className="text-gray-600" />
          </button>
          
          <h1 className="text-lg font-semibold text-gray-800 capitalize">
            {pathname.split("/").slice(-1)[0].replace(/-/g, " ")}
          </h1>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-medium text-gray-700">
                {user.role === "admin" ? user.username : user.name}
              </span>
              <span className="text-xs text-gray-500 capitalize">
                {user.role}
              </span>
            </div>
            <button
              onClick={() => {
                Cookies.remove("user");
                Cookies.remove("token");
                router.replace("/login");
              }}
              className="p-2 rounded-lg hover:bg-red-50 transition-colors text-red-500 hover:text-red-600"
            >
              <FaSignOutAlt className="text-lg" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
