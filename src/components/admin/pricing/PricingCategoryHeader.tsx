
import React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash2, MoreVertical, FileDown, FileImage } from "lucide-react";
import { PriceCategory } from "@/components/pricing/PriceCard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface PricingCategoryHeaderProps {
  category: PriceCategory;
  onAddItem: (category: PriceCategory) => void;
  onEditCategory: (category: PriceCategory) => void;
  onDeleteCategory: (category: PriceCategory) => void;
  onExportPdf?: (categoryId: string) => void;
  onExportPng?: (categoryId: string) => void;
  isMobile?: boolean;
}

const PricingCategoryHeader: React.FC<PricingCategoryHeaderProps> = ({
  category,
  onAddItem,
  onEditCategory,
  onDeleteCategory,
  onExportPdf,
  onExportPng,
  isMobile = false,
}) => {
  if (isMobile) {
    return (
      <div className="bg-pink-50 p-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-lg">{category.title}</h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white min-w-[180px]">
              <DropdownMenuItem onClick={() => onAddItem(category)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Dodaj usługę
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEditCategory(category)}>
                <Edit className="mr-2 h-4 w-4" />
                Edytuj kategorię
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {onExportPdf && (
                <DropdownMenuItem onClick={() => onExportPdf(category.id)}>
                  <FileDown className="mr-2 h-4 w-4" />
                  Eksportuj do PDF
                </DropdownMenuItem>
              )}
              {onExportPng && (
                <DropdownMenuItem onClick={() => onExportPng(category.id)}>
                  <FileImage className="mr-2 h-4 w-4" />
                  Eksportuj do PNG
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDeleteCategory(category)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Usuń kategorię
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-pink-50 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-lg">{category.title}</h3>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAddItem(category)}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Dodaj usługę
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEditCategory(category)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-red-500 hover:text-red-700"
            onClick={() => onDeleteCategory(category)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PricingCategoryHeader;
