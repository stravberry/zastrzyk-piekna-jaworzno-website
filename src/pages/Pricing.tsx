
import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PricingHero from "@/components/pricing/PricingHero";
import PricingNavigation from "@/components/pricing/PricingNavigation";
import PriceCard from "@/components/pricing/PriceCard";
import PricingInfo from "@/components/pricing/PricingInfo";
import { getPriceCategories } from "@/services/pricingService";
import { PriceCategory } from "@/components/pricing/PriceCard";

const Pricing = () => {
  const [priceCategories, setPriceCategories] = useState<PriceCategory[]>([]);

  useEffect(() => {
    // Load categories from the service
    setPriceCategories(getPriceCategories());
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24">
        {/* Hero Section */}
        <PricingHero />

        {/* Quick Navigation */}
        <PricingNavigation categories={priceCategories} />

        {/* Pricing Section - All Categories */}
        <section className="py-16 bg-white">
          <div className="container-custom space-y-16">
            {priceCategories.map((category) => (
              <PriceCard key={category.id} category={category} />
            ))}

            <PricingInfo />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
