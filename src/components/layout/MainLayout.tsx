import { ReactNode, useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

const SIDEBAR_STORAGE_KEY = "sidebar-collapsed";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    return saved === "true";
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar 
        isCollapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        isMobileOpen={mobileOpen}
        onMobileToggle={() => setMobileOpen(!mobileOpen)}
      />
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
        sidebarCollapsed ? "md:ml-16" : "md:ml-64"
      }`}>
        <Header />
        <main className="flex-1 p-6 pt-16 md:pt-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
