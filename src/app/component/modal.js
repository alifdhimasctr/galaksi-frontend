/*Modal*/

import React from "react";
import { FaTimes } from "react-icons/fa";

export default function Modal({ icon, title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-80 flex items-center justify-center bg-black/40">
      <div className="bg-white m-10 w-full max-w-xl rounded-lg shadow-lg overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-3 border-b">
          <h2 className="text-lg font-semibold text-blue-600 flex items-center gap-2">
            {icon} {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500"
          >
            <FaTimes />
          </button>
        </div >
        <div className="p-6">
          {children}
          </div>
      </div>
    </div>
  );
}
