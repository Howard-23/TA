"use client";

import { useState } from "react";
import { Menu, ChevronDown, LogOut, User } from "lucide-react";

export default function TopNav({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 h-14 flex items-center justify-between px-4 shrink-0">
      <button type="button" onClick={onToggleSidebar} className="p-2 text-gray-600 hover:bg-gray-100 rounded lg:hidden">
        <Menu size={20} />
      </button>
      <div className="flex-1" />
      <div className="relative">
        <button type="button" onClick={() => setOpen(!open)} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-50">
          <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700">
            <User size={16} />
          </div>
          <span className="text-sm font-medium text-gray-700 hidden sm:inline">Timetec Attendance</span>
          <ChevronDown size={14} className="text-gray-500" />
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute right-0 mt-1 w-48 bg-white border rounded-lg shadow-lg z-20 py-1">
              <a href="#" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                <User size={14} /> Edit Profile
              </a>
              <hr className="my-1" />
              <a href="/login" className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-50">
                <LogOut size={14} /> Log Out
              </a>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
