"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const SidebarAdmin: React.FC = () => {
  const pathname = usePathname();

  const linkClasses = (path: string) =>
    `block px-4 py-2 mb-2 rounded hover:bg-gray-200 ${
      pathname === path ? "bg-gray-300 font-semibold" : ""
    }`;

  return (
    <nav className="flex flex-col space-y-2">
      <Link href="/admin" className={linkClasses("/admin")}>
        PDFs
      </Link>
      <Link href="/admin/agent" className={linkClasses("/admin/agent")}>
        Agente
      </Link>
      <div className="mt-auto">
        <Link href="/auth/logout" className={linkClasses("/auth/logout")}>
          Cerrar sesión
        </Link>
      </div>
    </nav>
  );
};

export default SidebarAdmin;
