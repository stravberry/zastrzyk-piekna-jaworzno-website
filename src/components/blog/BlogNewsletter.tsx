
import React from "react";
import { Button } from "@/components/ui/button";

const BlogNewsletter: React.FC = () => {
  return (
    <section className="py-16 bg-pink-50">
      <div className="container-custom">
        <div className="bg-white rounded-lg p-8 shadow-md border border-pink-100 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-center font-playfair">
            Zapisz się do newslettera
          </h2>
          <p className="text-gray-600 mb-6 text-center">
            Otrzymuj najnowsze artykuły, porady kosmetyczne i informacje o promocjach
            bezpośrednio na swoją skrzynkę.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="Twój adres email"
              className="flex-grow px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            />
            <Button className="bg-pink-500 hover:bg-pink-600 text-white">
              Zapisz się
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-3 text-center">
            Szanujemy Twoją prywatność. W każdej chwili możesz wypisać się z newslettera.
          </p>
        </div>
      </div>
    </section>
  );
};

export default BlogNewsletter;
