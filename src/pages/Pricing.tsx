
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PricingHero from "@/components/pricing/PricingHero";
import PricingNavigation from "@/components/pricing/PricingNavigation";
import PriceCard from "@/components/pricing/PriceCard";
import PricingInfo from "@/components/pricing/PricingInfo";
import { priceCategories } from "@/data/pricingData";

const Pricing = () => {
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
