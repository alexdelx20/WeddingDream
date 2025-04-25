import { ReactNode } from "react";
import { Sidebar } from "./sidebar";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 p-4 md:p-6 max-w-full overflow-x-hidden">
        <div className="container mx-auto max-w-5xl">
          {children}
        </div>
      </main>
    </div>
  );
}