import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import logoPath from "@assets/My Wedding Dream.png";

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  // Get first letter of first name and last name for avatar
  const getInitials = () => {
    if (!user?.username) return "U";
    
    const parts = user.username.split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };
  
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/">
              <a className="flex items-center">
                <img src={logoPath} alt="My Wedding Dream Logo" className="h-12" />
                <h1 className="text-2xl font-heading ml-3 text-primary-foreground hidden md:block">
                  My Wedding Dream
                </h1>
              </a>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/">
              <a className={`font-body hover:text-primary-foreground transition duration-200 ${location === "/" ? "text-primary-foreground" : "text-foreground"}`}>
                Dashboard
              </a>
            </Link>
            <Link href="/wedding-settings">
              <a className={`font-body hover:text-primary-foreground transition duration-200 ${location === "/wedding-settings" ? "text-primary-foreground" : "text-foreground"}`}>
                Wedding Settings
              </a>
            </Link>
            <Link href="/help-center">
              <a className={`font-body hover:text-primary-foreground transition duration-200 ${location === "/help-center" ? "text-primary-foreground" : "text-foreground"}`}>
                Help Center
              </a>
            </Link>
            <button 
              className="flex items-center space-x-2 font-body text-foreground hover:text-primary-foreground transition duration-200"
              onClick={handleLogout}
            >
              <span>{user?.username}</span>
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-sm font-medium">{getInitials()}</span>
              </div>
            </button>
          </nav>
          
          {/* Mobile Navigation Toggle */}
          <button 
            className="md:hidden text-foreground p-2" 
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <i className="fas fa-bars text-xl"></i>
          </button>
        </div>
        
        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
            <nav className="flex flex-col space-y-4">
              <Link href="/">
                <a className={`font-body hover:text-primary-foreground transition duration-200 py-2 ${location === "/" ? "text-primary-foreground" : "text-foreground"}`}>
                  Dashboard
                </a>
              </Link>
              <Link href="/wedding-settings">
                <a className={`font-body hover:text-primary-foreground transition duration-200 py-2 ${location === "/wedding-settings" ? "text-primary-foreground" : "text-foreground"}`}>
                  Wedding Settings
                </a>
              </Link>
              <Link href="/help-center">
                <a className={`font-body hover:text-primary-foreground transition duration-200 py-2 ${location === "/help-center" ? "text-primary-foreground" : "text-foreground"}`}>
                  Help Center
                </a>
              </Link>
              <button 
                className="flex items-center space-x-2 font-body py-2 text-foreground hover:text-primary-foreground transition duration-200"
                onClick={handleLogout}
              >
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-sm font-medium">{getInitials()}</span>
                </div>
                <span>{user?.username}</span>
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
