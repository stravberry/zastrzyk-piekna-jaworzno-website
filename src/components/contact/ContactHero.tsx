
import React from "react";
import { Link } from "react-router-dom";

const ContactHero = () => {
  return (
    <section className="bg-pink-50 py-16">
      <div className="container-custom text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 font-playfair">
          <span className="text-pink-500">Kontakt </span>
          <span>z Gabinetem</span>
        </h1>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Skontaktuj się z nami, aby umówić wizytę w gabinecie kosmetologii estetycznej
          Zastrzyk Piękna w Jaworznie lub zadać pytanie dotyczące zabiegów.
        </p>
        <p className="text-gray-500 text-xs mt-10">
          <Link to="/admin" className="text-pink-500 hover:underline">Panel administratora</Link>
        </p>
      </div>
    </section>
  );
};

export default ContactHero;
