import { ReactNode } from "react";
import { Navbar } from "./navbar";
import { Footer } from "./footer";

interface ContainerProps {
  children: ReactNode;
}

export function Container({ children }: ContainerProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-background">
        {children}
      </main>
      <Footer />
    </div>
  );
}
