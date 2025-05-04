
import React, { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center justify-center pt-24">
        <div className="container-custom text-center py-16">
          <h1 className="text-8xl font-bold text-pink-500 mb-4 font-playfair">404</h1>
          <h2 className="text-3xl font-semibold mb-6">Strona nie znaleziona</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Przepraszamy, ale strona której szukasz nie istnieje lub została przeniesiona.
          </p>
          <Button asChild className="bg-pink-500 hover:bg-pink-600 text-white">
            <Link to="/">
              Wróć na stronę główną
            </Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
