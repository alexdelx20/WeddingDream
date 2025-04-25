import { Link } from "wouter";
import logoPath from "@assets/My Wedding Dream.png";

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Link href="/">
              <a>
                <img src={logoPath} alt="My Wedding Dream Logo" className="h-10" />
              </a>
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-6 mb-4 md:mb-0">
            <a href="#" className="text-muted-foreground hover:text-primary-foreground transition duration-200 font-body">
              About Us
            </a>
            <Link href="/help-center">
              <a className="text-muted-foreground hover:text-primary-foreground transition duration-200 font-body">
                Help Center
              </a>
            </Link>
            <a href="#" className="text-muted-foreground hover:text-primary-foreground transition duration-200 font-body">
              Privacy Policy
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary-foreground transition duration-200 font-body">
              Terms of Service
            </a>
          </div>
          <div className="flex space-x-4">
            <a href="#" className="text-muted-foreground hover:text-primary-foreground transition duration-200">
              <i className="fab fa-instagram text-xl"></i>
              <span className="sr-only">Instagram</span>
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary-foreground transition duration-200">
              <i className="fab fa-facebook text-xl"></i>
              <span className="sr-only">Facebook</span>
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary-foreground transition duration-200">
              <i className="fab fa-pinterest text-xl"></i>
              <span className="sr-only">Pinterest</span>
            </a>
          </div>
        </div>
        <div className="text-center text-muted-foreground text-sm mt-6">
          &copy; {new Date().getFullYear()} My Wedding Dream. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
