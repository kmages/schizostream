import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  LayoutDashboard, 
  ShieldAlert, 
  BookOpen, 
  Users, 
  Activity, 
  LogOut,
  Bot,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import logoImage from "@assets/generated_images/abstract_compass_wave_logo.png";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/chat", label: "AI Expert Support", icon: Bot, highlight: true },
  { href: "/vault", label: "The Vault", icon: ShieldAlert },
  { href: "/navigator", label: "Navigator", icon: BookOpen },
  { href: "/care-team", label: "Care Team", icon: Users },
  { href: "/data-logger", label: "Data Logger", icon: Activity },
  { href: "/admin", label: "Admin", icon: Settings },
];

export function Sidebar({ className }: { className?: string }) {
  const [location] = useLocation();
  const { logout, user } = useAuth();

  return (
    <aside className={cn("flex flex-col h-screen bg-slate-900 text-white w-64 fixed left-0 top-0 border-r border-slate-800", className)}>
      <Link href="/login">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800 cursor-pointer hover:bg-slate-800/50 transition-colors" data-testid="link-home-logo">
          <img src={logoImage} alt="SchizoStream Logo" className="w-10 h-10 rounded-lg" />
          <div>
            <h1 className="font-serif font-bold text-lg tracking-tight text-white">SchizoStream</h1>
            <p className="text-xs text-white/80">Crisis Navigation</p>
          </div>
        </div>
      </Link>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location === item.href;
          const hasHighlight = 'highlight' in item && item.highlight;
          return (
            <Link key={item.href} href={item.href}>
              <div 
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer group",
                  isActive 
                    ? "bg-teal-600 text-white shadow-lg shadow-teal-900/20" 
                    : hasHighlight && !isActive
                    ? "text-teal-300 hover:bg-teal-900/50 hover:text-white border border-teal-700/50"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-white" : hasHighlight ? "text-teal-400" : "text-slate-500 group-hover:text-white")} />
                <span className="font-medium flex-1">{item.label}</span>
                {hasHighlight && !isActive && (
                  <span className="text-[10px] font-bold bg-amber-500 text-amber-950 px-1.5 py-0.5 rounded">NEW</span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 bg-slate-950/50">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-8 h-8 rounded-full bg-teal-800 flex items-center justify-center text-xs font-bold text-teal-100 border border-teal-600">
            {user?.firstName?.[0] || user?.email?.[0] || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.firstName || 'User'}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>
        <Button 
          variant="destructive" 
          className="w-full justify-start pl-3 bg-red-900/20 hover:bg-red-900/40 text-red-200 border border-red-900/50"
          onClick={() => logout()}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
