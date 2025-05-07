
import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Eye, Calendar, ArrowRight } from "lucide-react";

const Blog = () => {
  // State for category filter
  const [activeCategory, setActiveCategory] = useState("Wszystkie");

  // Sample blog posts
  const blogPosts = [
    {
      id: 1,
      title: "Jak przygotować się do zabiegu modelowania ust?",
      excerpt: "Dowiedz się, co robić przed zabiegiem wypełniania ust, aby uzyskać najlepsze efekty i zminimalizować ryzyko powikłań.",
      date: "10 kwietnia 2025",
      category: "Modelowanie ust",
      image: "https://images.unsplash.com/photo-1619895092538-128962864398?q=80&w=1000&auto=format&fit=crop",
      readTime: "5 min",
      slug: "/blog/jak-przygotowac-sie-do-zabiegu-modelowania-ust",
    },
    {
      id: 2,
      title: "Pielęgnacja skóry po 40-tce - co warto wiedzieć?",
      excerpt: "Poznaj najważniejsze zasady pielęgnacji skóry dojrzałej i sprawdź, które składniki aktywne są niezastąpione w codziennej rutynie.",
      date: "28 marca 2025",
      category: "Anti-aging",
      image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1000&auto=format&fit=crop",
      readTime: "8 min",
      slug: "/blog/pielegnacja-skory-po-40-tce",
    },
    {
      id: 3,
      title: "Brwi idealne - makijaż permanentny czy laminacja?",
      excerpt: "Porównujemy dwa popularne zabiegi na brwi. Sprawdź, które rozwiązanie będzie lepsze dla Ciebie.",
      date: "15 marca 2025",
      category: "Makijaż permanentny",
      image: "https://images.unsplash.com/photo-1618073192936-7260d429283a?q=80&w=1000&auto=format&fit=crop",
      readTime: "6 min",
      slug: "/blog/brwi-idealne-makijaz-permanentny-czy-laminacja",
    },
    {
      id: 4,
      title: "Mezoterapia igłowa - wszystko co musisz wiedzieć",
      excerpt: "Szczegółowy przewodnik po mezoterapii igłowej - wskazania, przeciwwskazania, przebieg zabiegu i efekty.",
      date: "2 marca 2025",
      category: "Mezoterapia",
      image: "https://images.unsplash.com/photo-1614859334144-755b4f2b4b7f?q=80&w=1000&auto=format&fit=crop",
      readTime: "10 min",
      slug: "/blog/mezoterapia-iglowa-przewodnik",
    },
    {
      id: 5,
      title: "Jak dbać o skórę po peelingach chemicznych?",
      excerpt: "Poznaj zasady pielęgnacji skóry po peelingu chemicznym, aby zmaksymalizować efekty zabiegu i uniknąć podrażnień.",
      date: "18 lutego 2025",
      category: "Peelingi chemiczne",
      image: "https://images.unsplash.com/photo-1570554886111-e80fcca6a029?q=80&w=1000&auto=format&fit=crop",
      readTime: "7 min",
      slug: "/blog/jak-dbac-o-skore-po-peelingach-chemicznych",
    },
    {
      id: 6,
      title: "Autologiczne zabiegi w kosmetologii - przyszłość medycyny estetycznej",
      excerpt: "Dowiedz się więcej o zabiegach wykorzystujących materiał biologiczny pacjenta - fibrynie, osoczu i innych innowacyjnych metodach.",
      date: "5 lutego 2025",
      category: "Autologia",
      image: "https://images.unsplash.com/photo-1631815588090-d4bfec5b9866?q=80&w=1000&auto=format&fit=crop", 
      readTime: "9 min",
      slug: "/blog/autologiczne-zabiegi-w-kosmetologii",
    },
  ];

  // Categories for filtering (derived from blog posts)
  const categories = [
    "Wszystkie",
    ...new Set(blogPosts.map((post) => post.category)),
  ];

  // Filter posts by category
  const filteredPosts = activeCategory === "Wszystkie"
    ? blogPosts
    : blogPosts.filter(post => post.category === activeCategory);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24">
        {/* Hero Section */}
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

        {/* Blog Articles */}
        <section className="py-16 bg-white">
          <div className="container-custom">
            <div className="mb-12 overflow-x-auto">
              <div className="flex space-x-4 min-w-max">
                {categories.map((category, index) => (
                  <button
                    key={index}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      category === activeCategory
                        ? "bg-pink-500 text-white"
                        : "bg-pink-50 text-gray-700 hover:bg-pink-100"
                    }`}
                    onClick={() => setActiveCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-pink-100 flex flex-col"
                >
                  <Link to={post.slug} className="block h-48 overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </Link>
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs text-white bg-pink-500 px-2 py-1 rounded-full">
                        {post.category}
                      </span>
                      <div className="flex items-center text-gray-500 text-sm">
                        <Calendar size={14} className="mr-1" />
                        {post.date}
                      </div>
                    </div>
                    <Link to={post.slug} className="block mb-3">
                      <h3 className="text-xl font-bold text-gray-800 hover:text-pink-500 transition-colors font-playfair">
                        {post.title}
                      </h3>
                    </Link>
                    <p className="text-gray-600 mb-4 flex-grow">{post.excerpt}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-gray-500 text-sm">
                        <Eye size={14} className="mr-1" />
                        {post.readTime} czytania
                      </div>
                      <Link
                        to={post.slug}
                        className="text-pink-500 hover:text-pink-600 font-medium flex items-center transition-colors"
                      >
                        Czytaj więcej
                        <ArrowRight size={16} className="ml-1" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-12">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  className="border-pink-200 text-pink-500 hover:bg-pink-50"
                  disabled
                >
                  Poprzednia
                </Button>
                <Button variant="outline" className="bg-pink-500 text-white border-pink-500">
                  1
                </Button>
                <Button
                  variant="outline"
                  className="border-pink-200 text-pink-500 hover:bg-pink-50"
                >
                  2
                </Button>
                <Button
                  variant="outline"
                  className="border-pink-200 text-pink-500 hover:bg-pink-50"
                >
                  3
                </Button>
                <Button
                  variant="outline"
                  className="border-pink-200 text-pink-500 hover:bg-pink-50"
                >
                  Następna
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
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
      </main>
      <Footer />
    </div>
  );
};

export default Blog;
