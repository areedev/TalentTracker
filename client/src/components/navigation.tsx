import { Button } from "@/components/ui/button";
import { Settings, LogOut, Users } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function Navigation() {
  const [location] = useLocation();

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-4 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Users className="text-white" size={20} />
            </div>
            <h1 className="text-xl font-semibold text-slate-900">Talent Management</h1>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link href="/settings">
              <Button
                variant={location === "/settings" ? "default" : "ghost"}
                size="sm"
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Settings size={18} />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <LogOut size={18} />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
