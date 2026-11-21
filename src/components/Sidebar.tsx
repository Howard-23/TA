"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar, History, Clock, CheckCircle, Settings, Building, Database, Key, Users, Shield, FileText, XCircle,
} from "lucide-react";

function clsx(...args: (string | false | null | undefined)[]) {
  return args.filter(Boolean).join(" ");
}

const menu = [
  {
    title: "Attendance Synchronization",
    icon: Calendar,
    children: [
      { href: "/attendance", label: "Sync Attendance Form", icon: FileText },
      { href: "/attendance/logs", label: "Attendance Logs", icon: History },
      { href: "/attendance/status", label: "Synchronization Status", icon: Clock },
      { href: "/attendance/ot", label: "OT Approval", icon: CheckCircle },
      { href: "/attendance/missing", label: "Missed Punch Data", icon: Clock },
      { href: "/attendance/restricted", label: "Restricted Attendance Data", icon: XCircle },
    ],
  },
  {
    title: "Configuration",
    icon: Settings,
    children: [
      { href: "/settings/org", label: "Organization Settings", icon: Building },
      { href: "/settings/ot", label: "OT Configuration", icon: Settings },
      { href: "/settings/holidays", label: "Holidays", icon: Calendar },
      { href: "/settings/database", label: "SQL Database", icon: Database },
      { href: "/settings/credentials", label: "API Credentials", icon: Key },
    ],
  },
  {
    title: "Administration",
    icon: Shield,
    children: [
      { href: "/admin/audit", label: "Audit", icon: Database },
      { href: "/admin/users", label: "Users", icon: Users },
      { href: "/admin/roles", label: "Roles", icon: Shield },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-64 bg-[#2a3f54] text-gray-200 min-h-screen flex flex-col shrink-0">
      <div className="bg-[#eeeeee] px-4 py-3 flex items-center gap-2">
        <div className="w-8 h-8 bg-teal-600 rounded flex items-center justify-center text-white font-bold text-sm">T</div>
        <span className="text-[#2a3f54] font-semibold text-sm">Timetec</span>
      </div>
      <nav className="flex-1 overflow-y-auto py-2">
        {menu.map((section) => (
          <div key={section.title} className="mb-1">
            <div className="px-4 py-2 text-xs uppercase tracking-wider text-gray-400 flex items-center gap-2">
              <section.icon size={14} />
              {section.title}
            </div>
            <ul>
              {section.children.map((item) => {
                const active = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link href={item.href} className={clsx(
                      "flex items-center gap-2 px-6 py-2.5 text-sm transition-colors",
                      active ? "bg-teal-600/30 text-white border-l-4 border-teal-400" : "hover:bg-white/5 text-gray-300"
                    )}>
                      <item.icon size={15} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
