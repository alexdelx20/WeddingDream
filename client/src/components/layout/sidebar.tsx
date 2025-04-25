import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import logoPath from "@assets/My Wedding Dream.png";
import { 
  Home, 
  Settings, 
  HelpCircle, 
  LogOut, 
  Menu, 
  X, 
  Calendar, 
  Users, 
  DollarSign, 
  ShoppingBag,
  CheckSquare,
  Globe
} from "lucide-react";
import { useState, useEffect } from "react";
import { useLanguage, type Language } from "@/lib/language-context";
import { cn } from "@/lib/utils";

interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick?: () => void;
}

const SidebarLink = ({ href, icon, label, active, onClick }: SidebarLinkProps) => {
  const { translate } = useLanguage();
  
  return (
    <Link href={href}>
      <a 
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
          active 
            ? "bg-primary/10 text-primary" 
            : "text-foreground/70 hover:bg-primary/5 hover:text-primary"
        )}
        onClick={onClick}
      >
        {icon}
        <span className="font-body">{translate(label)}</span>
      </a>
    </Link>
  );
};

export function Sidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { language, setLanguage, isLoading } = useLanguage();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };
  
  // Get initials for the avatar
  const getInitials = () => {
    if (!user?.username) return "U";
    
    const parts = user.username.split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const renderSidebarContent = () => (
    <>
      <div className="flex items-center justify-center px-4 py-6">
        <img src={logoPath} alt="My Wedding Dream Logo" className="h-16 w-auto" />
      </div>
      
      <div className="mt-6 flex flex-col gap-2">
        <SidebarLink 
          href="/" 
          icon={<Home size={20} />} 
          label="Dashboard" 
          active={location === "/"} 
          onClick={() => setIsMobileOpen(false)}
        />
        <SidebarLink 
          href="/wedding-settings" 
          icon={<Settings size={20} />} 
          label="Wedding Settings" 
          active={location === "/wedding-settings"} 
          onClick={() => setIsMobileOpen(false)}
        />
        <SidebarLink 
          href="/checklist" 
          icon={<CheckSquare size={20} />} 
          label="Checklist" 
          active={location === "/checklist"} 
          onClick={() => setIsMobileOpen(false)}
        />
        <SidebarLink 
          href="/tasks" 
          icon={<Calendar size={20} />} 
          label="Wedding Timeline" 
          active={location === "/tasks"} 
          onClick={() => setIsMobileOpen(false)}
        />
        <SidebarLink 
          href="/guests" 
          icon={<Users size={20} />} 
          label="Guest List" 
          active={location === "/guests"} 
          onClick={() => setIsMobileOpen(false)}
        />
        <SidebarLink 
          href="/budget" 
          icon={<DollarSign size={20} />} 
          label="Budget" 
          active={location === "/budget"} 
          onClick={() => setIsMobileOpen(false)}
        />
        <SidebarLink 
          href="/vendors" 
          icon={<ShoppingBag size={20} />} 
          label="Vendors" 
          active={location === "/vendors"} 
          onClick={() => setIsMobileOpen(false)}
        />
        <SidebarLink 
          href="/help-center" 
          icon={<HelpCircle size={20} />} 
          label="Help Center" 
          active={location === "/help-center"} 
          onClick={() => setIsMobileOpen(false)}
        />
        <div className="border-t border-border my-2 mx-4"></div>
        <div className="px-4 py-1">
          <select 
            className={`w-full px-3 py-2 text-sm rounded-md border border-border text-foreground/70 ${isLoading ? 'opacity-50 cursor-wait' : ''}`}
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            disabled={isLoading}
          >
            <option value="en">🇬🇧 English</option>
            <option value="it">🇮🇹 Italiano</option>
            <option value="es">🇪🇸 Español</option>
            <option value="fr">🇫🇷 Français</option>
            <option value="de">🇩🇪 Deutsch</option>
          </select>
          {isLoading && (
            <div className="flex justify-center mt-1">
              <span className="text-xs text-primary">Translating...</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-auto px-4 py-6">
        {!isCollapsed ? (
          <div className="flex items-center gap-3 text-foreground/70">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-sm font-medium text-white">{getInitials()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.username}</p>
              <button 
                onClick={handleLogout}
                className="text-xs text-foreground/50 hover:text-primary transition-colors"
              >
                {translate("Sign out")}
              </button>
            </div>
          </div>
        ) : (
          <button 
            onClick={handleLogout} 
            className="flex items-center justify-center h-10 w-10 rounded-full hover:bg-primary/10"
          >
            <LogOut size={18} className="text-foreground/70" />
          </button>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside 
        className={cn(
          "hidden md:flex flex-col h-screen bg-white border-r border-border sticky top-0 left-0 transition-all duration-300 z-30",
          isCollapsed ? "w-[80px]" : "w-[280px]"
        )}
      >
        {renderSidebarContent()}
        
        <button 
          onClick={toggleSidebar}
          className="absolute top-6 -right-3 bg-white border border-border rounded-full p-1 shadow-sm"
        >
          {isCollapsed ? (
            <Menu size={16} className="text-foreground/70" />
          ) : (
            <X size={16} className="text-foreground/70" />
          )}
        </button>
      </aside>
      
      {/* Mobile Header */}
      <div className="flex md:hidden items-center justify-between h-16 px-4 border-b border-border bg-white sticky top-0 z-30">
        <div className="flex items-center justify-center">
          <img src={logoPath} alt="My Wedding Dream Logo" className="h-10 w-auto" />
        </div>
        
        <button 
          onClick={toggleMobileSidebar}
          className="p-2 text-foreground/70"
        >
          <Menu size={24} />
        </button>
      </div>
      
      {/* Mobile Sidebar (Overlay) */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setIsMobileOpen(false)}>
          <div 
            className="w-[280px] h-full bg-white shadow-xl p-2"
            onClick={(e) => e.stopPropagation()}
          >
            {renderSidebarContent()}
          </div>
        </div>
      )}
    </>
  );
}