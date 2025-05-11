
import React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface PricingEmptyStateProps {
  onAddCategory: () => void;
}

const PricingEmptyState: React.FC<PricingEmptyStateProps> = ({ onAddCategory }) => {
  return (
    <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
      <div className="text-gray-500 mb-4">
        Nie masz jeszcze żadnych kategorii cennika.
      </div>
      <Button 
        onClick={onAddCategory} 
        variant="default"
        className="bg-pink-500 hover:bg-pink-600"
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        Dodaj pierwszą kategorię
      </Button>
    </div>
  );
};

export default PricingEmptyState;
