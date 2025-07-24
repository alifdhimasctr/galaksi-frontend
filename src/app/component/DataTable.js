"use client";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  FaSort,
  FaSortUp,
  FaSortDown,
  FaSearch,
  FaPlus,
  FaEye,
  FaEdit,
  FaTrash,
  FaFilter,
} from "react-icons/fa";
import clsx from "clsx";
import Select from "react-select";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export default function DataTable({
  data,
  onAdd,
  onSearch,
  apiEndpoint,
  columns,
  filterOptions,
  paginationOptions,
}) {
  const [rows, setRows] = useState(data || []);
  const [loading, setLoading] = useState(!data);
  const [pagination, setPagination] = useState({
    pageIndex: paginationOptions?.pageIndex || 0,
    pageSize: paginationOptions?.pageSize || 10,
  });
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState({});

  useEffect(() => {
    if (data) {
      setRows(data);
      setLoading(false);
    }
  }, [data]);

  // Fetch data from API
  useEffect(() => {
    if (data) return; // parent already supplies rows → skip fetch
    let ignore = false;

    async function fetchData() {
      try {
        const token = Cookies.get("token");
        const { data: resp } = await axios.get(`${API}/${apiEndpoint}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!ignore) setRows(resp);
      } catch (err) {
        toast.error(err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    fetchData();
    return () => (ignore = true);
  }, [apiEndpoint, data]);

  // Filter data based on search and column filters
  const filteredData = useMemo(() => {
    const search = globalFilter.toLowerCase();
    return rows.filter((row) => {
      const isFilteredBySearch = JSON.stringify(row)
        .toLowerCase()
        .includes(search);
      const isFilteredByColumns = Object.entries(columnFilters).every(
        ([key, value]) => {
          if (!value) return true;
          return String(row[key]).toLowerCase() === String(value).toLowerCase();
        }
      );
      return isFilteredBySearch && isFilteredByColumns;
    });
  }, [rows, globalFilter, columnFilters]);

  // React Table setup
  const table = useReactTable({
    data: filteredData,
    columns,
    state: { pagination },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
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

  // Custom styles for react-select
  const selectStyles = {
    control: (base) => ({
      ...base,
      minHeight: "40px",
      borderRadius: "8px",
      borderColor: "#e5e7eb",
      boxShadow: "none",
      "&:hover": {
        borderColor: "#3b82f6",
      },
    }),
    indicatorSeparator: () => ({ display: "none" }),
    dropdownIndicator: (base) => ({
      ...base,
      color: "#6b7280",
      padding: "0 8px",
    }),
  };

  return (
    <div>
      <section className="space-y-6 bg-white p-4 rounded-lg">
        {filterOptions && (
          <header>
            <h1 className="text-xl md:text-2xl font-semibold text-gray-800">
              {filterOptions?.title || "Data Table"}
            </h1>
            <p className="text-xs md:text-sm text-gray-500">
              {filterOptions?.description || "Manage your data here"}
            </p>
          </header>
        )}

        {/* Search & Filters - Responsive Layout */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              {onAdd && (
                <button
                  onClick={onAdd}
                  className="flex text-sm items-center justify-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg shadow hover:bg-blue-700 whitespace-nowrap"
                >
                  <FaPlus /> Tambah
                </button>
              )}
              {onSearch && (
                <div className="relative w-full">
                  <input
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    placeholder="Cari..."
                    className="w-full border rounded pl-8 pr-3 py-2 text-sm"
                  />
                  <FaSearch className="absolute left-2 top-3 text-gray-400 text-xs" />
                </div>
              )}
            </div>
          </div>

          {/* Filters Grid */}
          {filterOptions?.filters && filterOptions.filters.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {filterOptions.filters.map((filter, index) => (
                <div key={index} className="flex flex-col">
                  <label
                    htmlFor={filter.id}
                    className="text-xs text-gray-600 mb-1"
                  >
                    {filter.label}
                  </label>
                  <select
                    id={filter.id}
                    value={columnFilters[filter.id] || ""}
                    onChange={(e) =>
                      setColumnFilters((prev) => ({
                        ...prev,
                        [filter.id]: e.target.value,
                      }))
                    }
                    className="border rounded px-2 py-2 text-xs md:text-sm"
                  >
                    <option value="">Semua</option>
                    {filter.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Table with Horizontal Scroll */}
        <div className="overflow-x-auto rounded-lg bg-white">
          <div className="min-w-full inline-block align-middle">
            <table className="w-full text-sm">
              <thead className="bg-gray-200 text-gray-700">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-2 py-3 text-left cursor-pointer select-none whitespace-nowrap md:px-4"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs md:text-sm">
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </span>
                          {sortIcon(header.column)}
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={columns.length} className="p-4 text-center">
                      Loading...
                    </td>
                  </tr>
                ) : table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-gray-50 border-y border-gray-200"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="px-2 py-2 whitespace-nowrap text-xs md:text-sm md:px-4"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length} className="p-4 text-center">
                      Data tidak ditemukan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Responsive Pagination */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs md:text-sm">Show</span>
            <select
              value={pagination.pageSize}
              onChange={(e) =>
                setPagination((p) => ({
                  ...p,
                  pageSize: Number(e.target.value),
                }))
              }
              className="border rounded px-2 py-1 text-xs md:text-sm"
            >
              {[5, 10, 25, 50].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
            <span className="text-xs md:text-sm">entries</span>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="text-xs md:text-sm">
              Page {pagination.pageIndex + 1} of {table.getPageCount()}
            </div>
            
            <div className="flex gap-1 justify-end flex-wrap">
              <PageBtn
                label="<"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              />
              {table.getPageOptions().map((page) => (
                <button
                  key={page}
                  onClick={() =>
                    setPagination((p) => ({ ...p, pageIndex: page }))
                  }
                  className={clsx(
                    "px-2 py-1 rounded text-xs md:text-sm",
                    pagination.pageIndex === page
                      ? "bg-blue-600 text-white"
                      : "bg-white border hover:bg-gray-50"
                  )}
                >
                  {page + 1}
                </button>
              ))}
              <PageBtn
                label=">"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Mobile Optimization CSS */}
      <style jsx>{`
        @media (max-width: 640px) {
          table th, table td {
            padding: 8px 4px;
          }
          .mobile-hidden {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

const PageBtn = ({ label, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={clsx(
      "px-2 py-1 rounded",
      disabled
        ? "bg-gray-200 text-gray-400"
        : "bg-white border hover:bg-gray-50"
    )}
  >
    {label}
  </button>
);
