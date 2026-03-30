import { useEffect, useState } from "react";
import { Menu, Sun, Moon, User, Settings, HelpCircle, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const HeaderMenu = () => {
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-2 rounded-lg bg-primary/10">
          <Menu className="text-primary" size={22} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => setDark(!dark)}>
          {dark ? <Sun size={16} className="mr-2" /> : <Moon size={16} className="mr-2" />}
          {dark ? "Light Mode" : "Dark Mode"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => toast.info("Account settings coming soon")}>
          <User size={16} className="mr-2" />
          Account Settings
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => toast.info("Preferences coming soon")}>
          <Settings size={16} className="mr-2" />
          Preferences
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => toast.info("Help center coming soon")}>
          <HelpCircle size={16} className="mr-2" />
          Help & Support
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => { window.location.href = "/"; }}>
          <LogOut size={16} className="mr-2" />
          Log Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default HeaderMenu;
