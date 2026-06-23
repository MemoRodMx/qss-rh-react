import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Breadcrumbs } from "./Breadcrumbs";
import { TooltipProvider } from "@/components/ui/tooltip";

export function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <TooltipProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((prev) => !prev)}
        />
        <main className="flex-1 overflow-y-auto p-8 animate-fade-in">
          <div className="max-w-7xl">
            <Breadcrumbs />
            <Outlet />
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}
