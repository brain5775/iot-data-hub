import { LayoutDashboard, Cpu, History, FileText, Activity, Settings, ChevronLeft, ChevronRight, Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Cpu, label: "Device", path: "/device" },
  { icon: History, label: "History", path: "/history" },
  { icon: FileText, label: "Report", path: "/report" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  isMobileOpen: boolean;
  onMobileToggle: () => void;
}

export function Sidebar({ isCollapsed, onToggle, isMobileOpen, onMobileToggle }: SidebarProps) {
  const location = useLocation();

  return (
    <>
      {/* Mobile hamburger button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onMobileToggle}
        className="fixed top-4 left-4 z-50 md:hidden"
      >
        {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={onMobileToggle}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-screen bg-sidebar flex flex-col transition-all duration-300 ease-in-out z-40
          ${isCollapsed ? "w-16" : "w-64"}
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden">
          <Activity className="w-6 h-6 text-sidebar-foreground flex-shrink-0" />
          {!isCollapsed && (
            <h1 className="text-xl font-bold text-sidebar-foreground whitespace-nowrap">
              PM<span className="font-light">Monitoring</span>
            </h1>
          )}
        </div>
      </div>

      {/* User Info */}
      {!isCollapsed && (
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center flex-shrink-0">
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
      )}

      {isCollapsed && (
        <div className="p-2 border-b border-sidebar-border flex justify-center">
          <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center">
            <span className="text-sidebar-foreground font-semibold">A</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-4">
        {!isCollapsed && (
          <p className="px-4 mb-2 text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider">
            Main Navigation
          </p>
        )}
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const linkContent = (
              <Link
                to={item.path}
                className={`sidebar-nav-item ${isActive ? "active" : ""} ${
                  isCollapsed ? "justify-center px-2" : ""
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            );

            if (isCollapsed) {
              return (
                <li key={item.path}>
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                    <TooltipContent side="right" className="bg-popover">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                </li>
              );
            }

            return <li key={item.path}>{linkContent}</li>;
          })}
        </ul>
      </nav>

      {/* Fixed Toggle Button - hidden on mobile */}
      <Button
        variant="outline"
        size="icon"
        onClick={onToggle}
        className={`fixed top-1/2 -translate-y-1/2 z-50 w-5 h-10 rounded-full bg-background border border-border shadow-md hover:shadow-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-all duration-300 hidden md:flex ${
          isCollapsed ? "left-[52px]" : "left-[252px]"
        }`}
      >
        {isCollapsed ? (
          <ChevronRight className="w-3.5 h-3.5" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5" />
        )}
      </Button>
    </aside>
    </>
  );
}
