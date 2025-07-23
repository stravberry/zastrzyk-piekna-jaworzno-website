
import React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, RefreshCw, FileDown, FileImage } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import PngQualitySelector from "./PngQualitySelector";

interface PricingActionsProps {
  onAddCategory: () => void;
  onResetData: () => void;
  onExportPdf: () => void;
  onExportPng: (quality?: 'web' | 'print' | 'social' | 'instagram') => void;
  isMobile?: boolean;
}

const PricingActions: React.FC<PricingActionsProps> = ({ 
  onAddCategory, 
  onResetData,
  onExportPdf,
  onExportPng,
  isMobile = false
}) => {
  if (isMobile) {
    return (
      <div className="flex flex-col gap-3 mb-4">
        <Button 
          onClick={onAddCategory} 
          variant="default" 
          className="bg-pink-500 hover:bg-pink-600 w-full"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Dodaj kategorię
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <span>Eksportuj / Resetuj</span>
              <FileDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-full min-w-[200px] bg-white" align="end">
            <DropdownMenuItem onClick={onExportPdf}>
              <FileDown className="mr-2 h-4 w-4" />
              Eksportuj pełny cennik do PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExportPng('instagram')}>
              <FileImage className="mr-2 h-4 w-4" />
              Eksportuj do PNG (Instagram)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onResetData}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Resetuj do wartości początkowych
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-3 mb-6 justify-between">
      <div className="flex flex-wrap gap-3">
        <Button onClick={onAddCategory} variant="default" className="bg-pink-500 hover:bg-pink-600">
          <PlusCircle className="mr-2 h-4 w-4" />
          Dodaj kategorię
        </Button>
        
        <Button 
          onClick={() => onExportPdf()} 
          variant="outline"
        >
          <FileDown className="mr-2 h-4 w-4" />
          Eksportuj pełny cennik do PDF
        </Button>
        
        <PngQualitySelector onExport={onExportPng} isFullExport={true} />
      </div>

      <Button onClick={onResetData} variant="ghost" size="sm">
        <RefreshCw className="mr-2 h-4 w-4" />
        Resetuj do wartości początkowych
      </Button>
    </div>
  );
};

export default PricingActions;
