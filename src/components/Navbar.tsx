
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAdvancedTracking } from "@/hooks/useAdvancedTracking";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { trackElementClick, trackContactAttempt } = useAdvancedTracking();

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    trackElementClick('menu_toggle', isOpen ? 'Close Menu' : 'Open Menu', 'mobile_navigation');
  };

  const handleNavClick = (linkName: string, path: string) => {
    trackElementClick('navigation_link', linkName, path);
  };

  const handleInstagramClick = () => {
    trackContactAttempt('instagram', '@zastrzyk_piekna');
  };

  const navLinks = [
    { name: "Strona Główna", path: "/" },
    { name: "O Mnie", path: "/o-mnie" },
    { name: "Zabiegi", path: "/uslugi" },
    { name: "Cennik", path: "/cennik" },
    { name: "Galeria", path: "/galeria" },
    { name: "Blog", path: "/blog" },
    { name: "Kontakt", path: "/kontakt" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white shadow-md py-2"
          : "bg-white/80 backdrop-blur-sm py-4"
      }`}
    >
      <div className="container-custom flex items-center justify-between">
        <Link 
          to="/" 
          className="flex items-center"
          onClick={() => trackElementClick('logo', 'Logo Click', 'navbar')}
        >
          <img 
            src="/lovable-uploads/3b19512b-b68a-4530-ac22-e8c824bf3cf3.png" 
            alt="Zastrzyk Piękna - Logo" 
            className="h-12 md:h-16"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="text-gray-700 hover:text-pink-500 transition-colors text-sm uppercase font-medium tracking-wide"
              onClick={() => handleNavClick(link.name, link.path)}
            >
              {link.name}
            </Link>
          ))}
          <Button
            asChild
            className="bg-pink-500 hover:bg-pink-600 text-white font-medium tracking-wide"
            onClick={handleInstagramClick}
          >
            <a 
              href="https://instagram.com/zastrzyk_piekna" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              Umów Wizytę
            </a>
          </Button>
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMenu}
          className="lg:hidden text-gray-700 focus:outline-none z-50"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {isOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Navigation with Animation */}
      <div 
        className={`fixed top-0 right-0 h-full w-full lg:hidden bg-black/30 backdrop-blur-sm transition-opacity duration-300 z-40 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
      >
        <div 
          className={`absolute top-0 right-0 h-full w-3/4 max-w-xs bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="container-custom py-4 flex flex-col space-y-4 pt-20 bg-white">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-gray-700 hover:text-pink-500 transition-colors py-2"
                onClick={() => {
                  setIsOpen(false);
                  handleNavClick(link.name, link.path);
                }}
              >
                {link.name}
              </Link>
            ))}
            <Button
              asChild
              className="bg-pink-500 hover:bg-pink-600 text-white w-full"
              onClick={handleInstagramClick}
            >
              <a 
                href="https://instagram.com/zastrzyk_piekna" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Umów Wizytę
              </a>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
