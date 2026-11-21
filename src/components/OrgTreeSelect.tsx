"use client";

import { useState, useMemo } from "react";
import { ChevronDown, ChevronRight, Check, Search } from "lucide-react";
import { OrgNode } from "@/lib/mock-data";

function clsx(...args: (string | false | null | undefined)[]) {
  return args.filter(Boolean).join(" ");
}

type Props = {
  data: OrgNode[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  placeholder?: string;
};

function collectIds(node: OrgNode): string[] {
  const ids = [node.id];
  if (node.subs) node.subs.forEach((s) => ids.push(...collectIds(s)));
  return ids;
}

function TreeNode({
  node, selected, onToggle, depth = 0,
}: {
  node: OrgNode;
  selected: Set<string>;
  onToggle: (id: string, cascade: boolean) => void;
  depth?: number;
}) {
  const [open, setOpen] = useState(depth < 1);
  const hasChildren = !!node.subs?.length;
  const isSelected = selected.has(node.id);
  const childIds = hasChildren ? node.subs!.flatMap(collectIds) : [];
  const allChildrenSelected = hasChildren && childIds.every((id) => selected.has(id));
  const someChildrenSelected = hasChildren && childIds.some((id) => selected.has(id));

  return (
    <div>
      <div className={clsx("flex items-center gap-1 py-1 px-1 rounded hover:bg-gray-100 cursor-pointer text-sm", isSelected && "bg-teal-50")} style={{ paddingLeft: depth * 14 + 4 }}>
        {hasChildren ? (
          <button type="button" className="p-0.5 text-gray-500" onClick={(e) => { e.stopPropagation(); setOpen(!open); }}>
            {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        ) : <span className="w-4" />}
        <button type="button" className={clsx("w-4 h-4 border rounded flex items-center justify-center shrink-0", isSelected || allChildrenSelected ? "bg-teal-600 border-teal-600 text-white" : someChildrenSelected ? "bg-teal-200 border-teal-400" : "border-gray-300")} onClick={() => onToggle(node.id, true)}>
          {(isSelected || allChildrenSelected) && <Check size={12} />}
        </button>
        <span className="truncate flex-1" onClick={() => onToggle(node.id, false)}>{node.title}</span>
      </div>
      {hasChildren && open && (
        <div>
          {node.subs!.map((child) => (
            <TreeNode key={child.id} node={child} selected={selected} onToggle={onToggle} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrgTreeSelect({ data, selectedIds, onChange, placeholder = "Select Organization" }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const selected = useMemo(() => new Set(selectedIds), [selectedIds]);

  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    function filterNodes(nodes: OrgNode[]): OrgNode[] {
      return nodes.map((n) => {
        const match = n.title.toLowerCase().includes(q);
        const subs = n.subs ? filterNodes(n.subs) : undefined;
        if (match || (subs && subs.length)) return { ...n, subs };
        return null;
      }).filter(Boolean) as OrgNode[];
    }
    return filterNodes(data);
  }, [data, search]);

  function toggle(id: string, cascade: boolean) {
    const next = new Set(selectedIds);
    const node = findNode(data, id);
    if (!node) return;
    const idsToToggle = cascade ? collectIds(node) : [id];
    const shouldSelect = !next.has(id);
    idsToToggle.forEach((i) => { if (shouldSelect) next.add(i); else next.delete(i); });
    onChange(Array.from(next));
  }

  function findNode(nodes: OrgNode[], id: string): OrgNode | null {
    for (const n of nodes) {
      if (n.id === id) return n;
      if (n.subs) {
        const found = findNode(n.subs, id);
        if (found) return found;
      }
    }
    return null;
  }

  const label = selectedIds.length === 0 ? placeholder : `${selectedIds.length} organization(s) selected`;

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(!open)} className="w-full text-left border border-gray-300 rounded px-3 py-2 bg-gray-100 text-sm flex justify-between items-center">
        <span className={selectedIds.length ? "text-gray-900" : "text-gray-500"}>{label}</span>
        <ChevronDown size={16} className="text-gray-500" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 mt-1 w-full max-h-80 overflow-auto bg-white border border-gray-200 rounded-lg shadow-lg">
            <div className="sticky top-0 bg-white p-2 border-b">
              <div className="relative">
                <Search size={14} className="absolute left-2 top-2.5 text-gray-400" />
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search organizations..." className="w-full pl-7 pr-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-teal-500" />
              </div>
            </div>
            <div className="p-1">
              {filtered.map((node) => (
                <TreeNode key={node.id} node={node} selected={selected} onToggle={toggle} />
              ))}
              {filtered.length === 0 && <p className="text-sm text-gray-500 p-3 text-center">No organizations found</p>}
            </div>
            <div className="sticky bottom-0 bg-gray-50 border-t p-2 flex justify-between text-xs">
              <button type="button" className="text-teal-700 hover:underline" onClick={() => onChange(data.flatMap(collectIds))}>Select all</button>
              <button type="button" className="text-gray-600 hover:underline" onClick={() => onChange([])}>Clear</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
