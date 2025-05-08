
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface PricingActionsProps {
  onAddCategory: () => void;
  onResetData: () => void;
}

const PricingActions: React.FC<PricingActionsProps> = ({ onAddCategory, onResetData }) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <Button onClick={onAddCategory} variant="default" className="mr-2">
          <Plus className="mr-1" /> Dodaj kategorię
        </Button>
        <Button onClick={onResetData} variant="outline" className="ml-2">
          Resetuj dane
        </Button>
      </div>
    </div>
  );
};

export default PricingActions;
