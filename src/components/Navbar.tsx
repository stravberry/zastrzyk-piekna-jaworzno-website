
// Navigation component with responsive design
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetClose, SheetTrigger } from "@/components/ui/sheet";
import { useAdvancedTracking } from "@/hooks/useAdvancedTracking";
import LogoWithFallback from "@/components/ui/LogoWithFallback";
import AnimatedBurgerIcon from "@/components/ui/AnimatedBurgerIcon";
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
      className={`fixed top-0 left-0 w-full z-[60] transition-all duration-300 ${scrolled ? "bg-white shadow-md" : "bg-white/80 backdrop-blur-sm"}`}
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

        {/* Mobile Menu */}
        <Sheet
          open={isOpen}
          onOpenChange={(open) => {
            setIsOpen(open);
            trackElementClick('menu_toggle', open ? 'Open Menu' : 'Close Menu', 'mobile_navigation');
          }}
        >
            <SheetTrigger asChild>
              <button
                className="lg:hidden text-gray-700 focus:outline-none relative z-[70]"
                aria-label={isOpen ? "Zamknij menu" : "Otwórz menu"}
                onClick={() => {
                  trackElementClick('menu_toggle', !isOpen ? 'Open Menu' : 'Close Menu', 'mobile_navigation');
                }}
              >
                <AnimatedBurgerIcon isOpen={isOpen} />
              </button>
            </SheetTrigger>

          <SheetContent side="right" className="w-[80vw] sm:w-80 p-0 z-[80] [&>button.absolute.right-4.top-4]:hidden">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between px-4 py-4 border-b">
                <span className="text-sm font-medium uppercase tracking-wide text-gray-500">Menu</span>
                <SheetClose asChild>
                  <button
                    className="text-gray-700 focus:outline-none"
                    aria-label="Zamknij menu"
                    onClick={() => trackElementClick('menu_toggle', 'Close Menu', 'mobile_navigation')}
                  >
                    <AnimatedBurgerIcon isOpen={true} />
                  </button>
                </SheetClose>
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
          </SheetContent>
        </Sheet>
      </div>

    </header>
  );
};

export default Navbar;
