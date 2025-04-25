import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Menu, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import logoPath from "@assets/My Wedding Dream.png";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const initials = user?.firstName && user?.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`
    : user?.username?.substring(0, 2).toUpperCase() || "U";

  const links = [
    { href: "/", label: "Dashboard" },
    { href: "/settings", label: "Wedding Settings" },
    { href: "/help", label: "Help Center" },
  ];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="bg-white shadow-soft">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/">
              <img src={logoPath} alt="My Wedding Dream Logo" className="h-12 cursor-pointer" />
            </Link>
            <h1 className="text-2xl font-heading ml-3 text-primary-dark hidden md:block">
              My Wedding Dream
            </h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {links.map((link) => (
              <Link key={link.href} href={link.href}>
                <a className={`font-body ${location === link.href ? 'text-primary-dark' : 'text-foreground'} hover:text-primary-dark transition duration-200`}>
                  {link.label}
                </a>
              </Link>
            ))}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 font-body text-foreground hover:text-primary-dark transition duration-200">
                  <span>{user?.firstName || user?.username}</span>
                  <Avatar className="h-8 w-8 bg-primary-light">
                    <AvatarFallback className="text-sm font-medium">{initials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <div className="cursor-pointer w-full">Profile</div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Mobile Navigation Toggle */}
          <button
            className="md:hidden text-foreground p-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <X className="text-xl" />
            ) : (
              <Menu className="text-xl" />
            )}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4">
            <nav className="flex flex-col space-y-4">
              {links.map((link) => (
                <Link key={link.href} href={link.href}>
                  <a 
                    className={`font-body ${location === link.href ? 'text-primary-dark' : 'text-foreground'} hover:text-primary-dark transition duration-200 py-2`}
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </a>
                </Link>
              ))}
              <div className="flex items-center space-x-2 font-body py-2">
                <Avatar className="h-8 w-8 bg-primary-light">
                  <AvatarFallback className="text-sm font-medium">{initials}</AvatarFallback>
                </Avatar>
                <span>{user?.firstName || user?.username}</span>
              </div>
              <Button 
                variant="ghost" 
                className="justify-start px-0 font-body hover:text-primary-dark"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
