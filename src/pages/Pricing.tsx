
import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PricingHero from "@/components/pricing/PricingHero";
import PricingNavigation from "@/components/pricing/PricingNavigation";
import PriceCard from "@/components/pricing/PriceCard";
import PricingInfo from "@/components/pricing/PricingInfo";
import { getPriceCategories } from "@/services/pricingService";
import { PriceCategory } from "@/components/pricing/PriceCard";
import { Skeleton } from "@/components/ui/skeleton";

const Pricing = () => {
  const [priceCategories, setPriceCategories] = useState<PriceCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const categories = await getPriceCategories();
        setPriceCategories(categories);
      } catch (error) {
        console.error("Error loading price categories:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24">
        {/* Hero Section */}
        <PricingHero />

        {/* Quick Navigation */}
        {!loading && <PricingNavigation categories={priceCategories} />}

        {/* Pricing Section - All Categories */}
        <section className="py-16 bg-white">
          <div className="container-custom space-y-16">
            {loading ? (
              // Loading skeleton
              Array(5).fill(0).map((_, index) => (
                <div key={index} className="space-y-4">
                  <Skeleton className="h-12 w-full max-w-md" />
                  <Skeleton className="h-64 w-full" />
                </div>
              ))
            ) : (
              priceCategories.map((category) => (
                <PriceCard key={category.id} category={category} />
              ))
            )}

            <PricingInfo />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
