"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { clearToken, getToken } from "@/lib/auth";
import { LayoutDashboard, Crown, LogOut } from "lucide-react";
import clsx from "clsx";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!getToken()) {
      router.replace("/login");
    }
  }, [router]);

  function logout() {
    clearToken();
    router.push("/login");
  }

  if (!mounted) return null;

  const nav = [
    { href: "/workspaces", label: "Workspaces", icon: LayoutDashboard },
    { href: "/leadership", label: "Leadership View", icon: Crown },
  ];

  return (
    <div className="flex h-screen bg-[#f8f9fa]">
      {/* Sidebar */}
      <aside className="w-56 bg-[#1B2A4A] flex flex-col">
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#DA291C] rounded-sm" />
            <span className="text-white font-bold text-sm tracking-wider">CMHC</span>
          </div>
          <p className="text-blue-200 text-xs mt-1 leading-tight">Policy Simulator</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                pathname === href || pathname.startsWith(href + "/")
                  ? "bg-white/10 text-white"
                  : "text-blue-200 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-sm text-blue-200 hover:bg-white/5 hover:text-white transition-colors"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
