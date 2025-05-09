
import React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, RefreshCw, FileDown } from "lucide-react";

interface PricingActionsProps {
  onAddCategory: () => void;
  onResetData: () => void;
  onExportPdf: () => void;
}

const PricingActions: React.FC<PricingActionsProps> = ({ 
  onAddCategory, 
  onResetData,
  onExportPdf
}) => {
  return (
    <div className="flex flex-wrap gap-3 mb-6 justify-between">
      <div className="flex gap-3">
        <Button onClick={onAddCategory} variant="default" className="bg-pink-500 hover:bg-pink-600">
          <PlusCircle className="mr-2 h-4 w-4" />
          Dodaj kategorię
        </Button>
        
        <Button onClick={onExportPdf} variant="outline">
          <FileDown className="mr-2 h-4 w-4" />
          Eksportuj do PDF
        </Button>
      </div>

      <Button onClick={onResetData} variant="ghost" size="sm">
        <RefreshCw className="mr-2 h-4 w-4" />
        Resetuj do wartości początkowych
      </Button>
    </div>
  );
};

export default PricingActions;
