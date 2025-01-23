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
        Agent
      </Link>
    </nav>
  );
};

export default SidebarAdmin;
