
// Navigation component with responsive design
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAdvancedTracking } from "@/hooks/useAdvancedTracking";
import LogoWithFallback from "@/components/ui/LogoWithFallback";
import logo from "@/assets/zastrzyk-piekna-logo.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { trackElementClick, trackContactAttempt } = useAdvancedTracking();

  // Cache scroll position to avoid excessive reads
  const scrollPosition = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        ticking.current = true;
        requestAnimationFrame(() => {
          const currentScroll = window.scrollY;
          // Only update state if scroll threshold is crossed
          if ((currentScroll > 50) !== scrolled) {
            setScrolled(currentScroll > 50);
          }
          scrollPosition.current = currentScroll;
          ticking.current = false;
        });
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    trackElementClick('menu_toggle', isOpen ? 'Close Menu' : 'Open Menu', 'mobile_navigation');
  };

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const handleNavClick = (linkName: string, path: string) => {
    trackElementClick('navigation_link', linkName, path);
  };

  const handleInstagramClick = () => {
    trackContactAttempt('instagram', '@zastrzyk_piekna');
  };

  const navLinks = [
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
          ? "bg-white shadow-md"
          : "bg-white/80 backdrop-blur-sm"
      }`}
    >
      <div className="container-custom flex items-center justify-between">
        <Link 
          to="/" 
          className="flex items-center"
          onClick={() => trackElementClick('logo', 'Logo Click', 'navbar')}
        >
          <div className="h-24 md:h-32 w-auto flex items-center">
            <img 
              src={logo} 
              alt="Zastrzyk Piękna - Kosmetolog Anna Gajęcka" 
              className="h-16 md:h-20 w-auto object-contain"
            />
          </div>
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
          className="lg:hidden text-gray-700 focus:outline-none z-[80] relative"
          aria-label={isOpen ? "Zamknij menu" : "Otwórz menu"}
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

      {/* Mobile Navigation Overlay */}
      <div className={`fixed inset-0 lg:hidden z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
        
        {/* Sliding Panel */}
        <div 
          className={`absolute top-0 right-0 h-full w-3/4 max-w-xs bg-white shadow-2xl z-[70] will-change-transform
            transform transition-transform duration-300 ease-in-out ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col h-full">
            {/* Header with logo space */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="h-12 flex items-center">
                <img 
                  src={logo} 
                  alt="Zastrzyk Piękna" 
                  className="h-8 w-auto object-contain"
                />
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors z-[80]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-4 py-6">
              <div className="space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className="block px-3 py-3 text-base font-medium text-gray-800 hover:text-pink-500 hover:bg-pink-50 rounded-lg transition-all duration-200"
                    onClick={() => {
                      setIsOpen(false);
                      handleNavClick(link.name, link.path);
                    }}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>

              {/* CTA Button */}
              <div className="mt-8 px-3">
                <Button
                  asChild
                  className="bg-pink-500 hover:bg-pink-600 text-white w-full py-3 text-base font-medium rounded-lg"
                  onClick={() => {
                    setIsOpen(false);
                    handleInstagramClick();
                  }}
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
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
