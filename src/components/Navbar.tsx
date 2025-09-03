
// Navigation component with responsive design
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAdvancedTracking } from "@/hooks/useAdvancedTracking";
import ImageWithLoading from "@/components/ui/image-with-loading";

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
          <ImageWithLoading 
            src="/lovable-uploads/ca8b4446-c52a-49cd-8797-c645d772eb94.png" 
            alt="Zastrzyk Piękna — logo gabinetu" 
            className="h-24 md:h-32 logo-image"
            sizes="(max-width: 768px) 96px, 128px"
            priority={true}
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
