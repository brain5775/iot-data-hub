import { LayoutDashboard, Cpu, History, FileText, Activity } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Cpu, label: "Device", path: "/device" },
  { icon: History, label: "History", path: "/history" },
  { icon: FileText, label: "Report", path: "/report" },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 min-h-screen bg-sidebar flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <Activity className="w-6 h-6 text-sidebar-foreground" />
          <h1 className="text-xl font-bold text-sidebar-foreground">
            PM<span className="font-light">Monitoring</span>
          </h1>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center">
            <span className="text-sidebar-foreground font-semibold">A</span>
          </div>
          <div>
            <p className="text-sm font-medium text-sidebar-foreground">Admin</p>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
              <span className="text-xs text-sidebar-foreground/70">Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        <p className="px-4 mb-2 text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider">
          Main Navigation
        </p>
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`sidebar-nav-item ${isActive ? "active" : ""}`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
