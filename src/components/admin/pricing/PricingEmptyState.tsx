
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface PricingEmptyStateProps {
  onAddCategory: () => void;
}

const PricingEmptyState: React.FC<PricingEmptyStateProps> = ({ onAddCategory }) => {
  return (
    <div className="text-center py-8">
      <p className="text-gray-500 mb-4">Nie znaleziono żadnych kategorii w cenniku</p>
      <Button onClick={onAddCategory}>
        <Plus className="mr-1" /> Dodaj pierwszą kategorię
      </Button>
    </div>
  );
};

export default PricingEmptyState;
