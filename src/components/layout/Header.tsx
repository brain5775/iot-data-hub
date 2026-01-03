import { Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="h-14 gradient-header flex items-center justify-between px-4 shadow-md">
      <Button
        variant="ghost"
        size="icon"
        onClick={onMenuClick}
        className="text-primary-foreground hover:bg-primary/20"
      >
        <Menu className="w-5 h-5" />
      </Button>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-primary-foreground">
          <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
          <span className="text-sm font-medium">Admin</span>
        </div>
      </div>
    </header>
  );
}
