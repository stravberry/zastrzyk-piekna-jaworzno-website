
import React from "react";

const BlogHero: React.FC = () => {
  return (
    <section className="bg-pink-50 py-16">
      <div className="container-custom text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 font-playfair">
          <span className="text-pink-500">Blog </span>
          <span>Kosmetologiczny</span>
        </h1>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Zapraszam do lektury profesjonalnych artykułów na temat kosmetologii, 
          pielęgnacji skóry oraz najnowszych trendów w branży beauty.
        </p>
      </div>
    </section>
  );
};

export default BlogHero;
