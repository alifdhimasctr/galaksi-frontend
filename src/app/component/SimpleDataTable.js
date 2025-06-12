"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useReactTable, getCoreRowModel } from "@tanstack/react-table";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export default function SimpleDataTable({ apiEndpoint, columns }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from API
  useEffect(() => {
    async function fetchData() {
      try {
        const token = Cookies.get("token");
        const { data } = await axios.get(`${API}/${apiEndpoint}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRows(data);
      } catch (err) {
        toast.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [apiEndpoint]);

  // React Table setup
  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const sortIcon = (c) =>
    c.getCanSort() ? (
      c.getIsSorted() === "asc" ? (
        <FaSortUp />
      ) : c.getIsSorted() === "desc" ? (
        <FaSortDown />
      ) : (
        <FaSort className="opacity-30" />
      )
    ) : null;

  return (
    <div>
      {/* Table */}
      <div className="overflow-x-auto rounded-lg bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-200 text-gray-700">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left cursor-pointer select-none whitespace-nowrap"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-2">
                      {header.column.columnDef.header} {sortIcon(header.column)}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="p-4 text-center">Loading...</td>
              </tr>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 border-y border-gray-200 py-1">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-2 whitespace-nowrap">{cell.render("Cell")}</td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="p-4 text-center">No data available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
