import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Home, Menu } from "lucide-react";
import { Link } from "wouter";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import logoImage from "@assets/generated_images/abstract_compass_wave_logo.png";

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
          <p className="text-slate-500 font-medium">Securing connection...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Rely on useAuth redirect or allow the login page to show
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900 text-white px-4 py-3 flex items-center justify-between gap-2 border-b border-slate-800">
        <Link href="/login">
          <div className="flex items-center gap-2" data-testid="link-mobile-home">
            <img src={logoImage} alt="SchizoStream Logo" className="w-8 h-8 rounded-lg" />
            <span className="font-serif font-bold text-sm">SchizoStream</span>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button size="icon" variant="ghost" className="text-white" data-testid="button-mobile-dashboard">
              <Home className="w-5 h-5" />
            </Button>
          </Link>
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" className="bg-teal-600 hover:bg-teal-700 text-white" data-testid="button-mobile-menu">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="p-0 w-64">
              <Sidebar className="w-full h-full static" />
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <Sidebar className="hidden md:flex z-50" />
      <main className="md:ml-64 min-h-screen transition-all duration-300 pt-14 md:pt-0">
        <div className="container mx-auto p-4 md:p-8 max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
