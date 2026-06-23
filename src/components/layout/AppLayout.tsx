import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { Breadcrumbs } from "./Breadcrumbs";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  return (
    <TooltipProvider>
      <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
        <div className="flex h-screen overflow-hidden bg-background">
          {/* Desktop sidebar */}
          <div className="hidden md:block shrink-0">
            <Sidebar
              collapsed={sidebarCollapsed}
              onToggle={() => setSidebarCollapsed((prev) => !prev)}
            />
          </div>

          {/* Content area */}
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Mobile header */}
            <header className="md:hidden flex items-center gap-3 min-h-14 py-2 px-4 border-b border-border/40 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileSheetOpen(true)}
                className="cursor-pointer text-[hsl(var(--sidebar-muted))] hover:text-[hsl(var(--sidebar-text))]"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="flex-1 min-w-0 [&_nav]:mb-0">
                <Breadcrumbs />
              </div>
            </header>

            <main className="flex-1 overflow-y-auto p-4 md:p-8 animate-fade-in">
              {/* Desktop breadcrumbs */}
              <div className="hidden md:block">
                <Breadcrumbs />
              </div>
              <div className="max-w-7xl">
                <Outlet />
              </div>
            </main>
          </div>
        </div>

        {/* Mobile sidebar sheet */}
        <SheetContent
          side="left"
          className="p-0 w-64 max-w-[85vw]"
          showCloseButton={false}
        >
          <Sidebar
            collapsed={false}
            variant="sheet"
            onToggle={() => setMobileSheetOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </TooltipProvider>
  );
}
