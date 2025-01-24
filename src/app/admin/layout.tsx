"use client";

import React from "react";
import SidebarAdmin from "../components/SidebarAdmin";
import RouteGuard from "../context/RouteGuard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard role="admin">
      <div className="min-h-screen flex flex-col md:flex-row">
        {/* Sidebar */}
        <div className="w-full md:w-1/4 bg-background p-4">
          <SidebarAdmin />
        </div>

        {/* Main content */}
        <div className="flex-1 p-6 bg-background">
          {children}
        </div>
      </div>
    </RouteGuard>
  );
}
