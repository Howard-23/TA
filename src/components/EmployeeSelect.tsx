"use client";

import { useState, useMemo } from "react";
import { ChevronDown, Check, Search, Users } from "lucide-react";

function clsx(...args: (string | false | null | undefined)[]) {
  return args.filter(Boolean).join(" ");
}

export type EmpOption = {
  id: string;
  title: string;
  name?: string;
  emp_code?: string;
  organization_name?: string;
};

type Props = {
  options: EmpOption[];
  selectedIds: string[];
  onChange: (ids: string[], data: Record<string, string>) => void;
  placeholder?: string;
  disabled?: boolean;
};

export default function EmployeeSelect({ options, selectedIds, onChange, placeholder = "Select Employees", disabled = false }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const selected = useMemo(() => new Set(selectedIds), [selectedIds]);

  const filtered = useMemo(() => {
    if (!search.trim()) return options;
    const q = search.toLowerCase();
    return options.filter((o) => o.title.toLowerCase().includes(q) || o.name?.toLowerCase().includes(q) || o.emp_code?.toLowerCase().includes(q));
  }, [options, search]);

  function toggle(id: string) {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    const ids = Array.from(next);
    const data: Record<string, string> = {};
    options.forEach((o) => { if (next.has(o.id)) data[o.id] = o.title; });
    onChange(ids, data);
  }

  function selectAll() {
    const ids = filtered.map((o) => o.id);
    const data: Record<string, string> = {};
    filtered.forEach((o) => (data[o.id] = o.title));
    onChange(ids, data);
  }

  const label = selectedIds.length === 0 ? placeholder : `${selectedIds.length} employee(s) selected`;

  return (
    <div className="relative">
      <button type="button" disabled={disabled} onClick={() => !disabled && setOpen(!open)} className={clsx("w-full text-left border border-gray-300 rounded px-3 py-2 text-sm flex justify-between items-center", disabled ? "bg-gray-50 text-gray-400 cursor-not-allowed" : "bg-gray-100")}>
        <span className={selectedIds.length ? "text-gray-900" : "text-gray-500"}>{label}</span>
        <ChevronDown size={16} className="text-gray-500" />
      </button>
      {open && !disabled && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 mt-1 w-full max-h-80 overflow-auto bg-white border border-gray-200 rounded-lg shadow-lg">
            <div className="sticky top-0 bg-white p-2 border-b space-y-2">
              <div className="relative">
                <Search size={14} className="absolute left-2 top-2.5 text-gray-400" />
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search employees..." className="w-full pl-7 pr-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-teal-500" />
              </div>
              <div className="flex gap-2 text-xs">
                <button type="button" className="text-teal-700 hover:underline flex items-center gap-1" onClick={selectAll}><Users size={12} /> Select all ({filtered.length})</button>
                <button type="button" className="text-gray-600 hover:underline" onClick={() => onChange([], {})}>Clear</button>
              </div>
            </div>
            <div className="p-1">
              {filtered.map((opt) => {
                const isSel = selected.has(opt.id);
                return (
                  <div key={opt.id} className={clsx("flex items-center gap-2 py-1.5 px-2 rounded cursor-pointer text-sm hover:bg-gray-50", isSel && "bg-teal-50")} onClick={() => toggle(opt.id)}>
                    <span className={clsx("w-4 h-4 border rounded flex items-center justify-center shrink-0", isSel ? "bg-teal-600 border-teal-600 text-white" : "border-gray-300")}>
                      {isSel && <Check size={12} />}
                    </span>
                    <div className="min-w-0">
                      <div className="truncate font-medium">{opt.title}</div>
                      {opt.organization_name && <div className="text-xs text-gray-500 truncate">{opt.organization_name}</div>}
                    </div>
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <p className="text-sm text-gray-500 p-3 text-center">
                  {options.length === 0 ? "Filter organizations first to load employees" : "No employees match your search"}
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
