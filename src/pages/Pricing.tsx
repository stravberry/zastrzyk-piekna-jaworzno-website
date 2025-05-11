
import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PricingHero from "@/components/pricing/PricingHero";
import PricingNavigation from "@/components/pricing/PricingNavigation";
import PriceCard from "@/components/pricing/PriceCard";
import PricingInfo from "@/components/pricing/PricingInfo";
import { getPriceCategories } from "@/services/pricing";
import { PriceCategory } from "@/components/pricing/PriceCard";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Pricing = () => {
  const [priceCategories, setPriceCategories] = useState<PriceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load categories initially and set up real-time subscription
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const categories = await getPriceCategories();
        setPriceCategories(categories);
      } catch (error) {
        console.error("Error loading price categories:", error);
        setError("Nie udało się załadować cennika. Spróbuj ponownie później.");
      } finally {
        setLoading(false);
      }
    };

    loadCategories();

    // Set up real-time subscription
    const channel = supabase
      .channel('pricing-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'pricing_categories',
        },
        async (payload) => {
          console.log('Real-time update received:', payload);
          
          try {
            // Reload all categories when any changes are detected
            // This ensures we always have the latest data
            const categories = await getPriceCategories();
            setPriceCategories(categories);
            
            // Show a toast notification
            if (payload.eventType === 'INSERT') {
              toast.success('Dodano nową kategorię');
            } else if (payload.eventType === 'UPDATE') {
              toast.success('Zaktualizowano kategorię');
            } else if (payload.eventType === 'DELETE') {
              toast.success('Usunięto kategorię');
            }
          } catch (error) {
            console.error('Error refreshing categories after real-time update:', error);
            toast.error('Wystąpił problem z synchronizacją cennika');
          }
        }
      )
      .subscribe();

    // Clean up subscription when component unmounts
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24">
        {/* Hero Section */}
        <PricingHero />

        {/* Quick Navigation */}
        {!loading && priceCategories.length > 0 && (
          <PricingNavigation categories={priceCategories} />
        )}

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
            ) : error ? (
              // Error state
              <div className="text-center py-10">
                <p className="text-red-500 mb-4">{error}</p>
                <button 
                  className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600" 
                  onClick={() => window.location.reload()}
                >
                  Odśwież stronę
                </button>
              </div>
            ) : priceCategories.length === 0 ? (
              // Empty state
              <div className="text-center py-10">
                <p className="text-gray-500">
                  Aktualnie nie ma dostępnych kategorii cennika. Zapraszamy wkrótce.
                </p>
              </div>
            ) : (
              // Render price categories
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
