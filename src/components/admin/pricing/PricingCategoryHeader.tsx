
import React from "react";
import { PriceCategory } from "@/components/pricing/PriceCard";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash2, FileDown, FileImage, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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
      <div className="bg-pink-50 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-pink-800">{category.title}</h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => onAddItem(category)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Dodaj usługę
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
              <DropdownMenuItem onClick={() => onEditCategory(category)}>
                <Edit className="mr-2 h-4 w-4" />
                Edytuj kategorię
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDeleteCategory(category)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Usuń kategorię
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="text-sm text-gray-600">
          {category.items.length} {category.items.length === 1 ? 'usługa' : 'usług'}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-pink-50 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-pink-800">{category.title}</h3>
          <p className="text-sm text-gray-600">
            {category.items.length} {category.items.length === 1 ? 'usługa' : 'usług'}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={() => onAddItem(category)} 
            size="sm" 
            variant="outline"
            className="bg-white hover:bg-gray-50"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Dodaj usługę
          </Button>
          
          {onExportPdf && (
            <Button 
              onClick={() => onExportPdf(category.id)} 
              size="sm" 
              variant="outline"
              className="bg-white hover:bg-gray-50"
            >
              <FileDown className="mr-2 h-4 w-4" />
              PDF
            </Button>
          )}
          
          {onExportPng && (
            <Button 
              onClick={() => onExportPng(category.id)} 
              size="sm" 
              variant="outline"
              className="bg-white hover:bg-gray-50"
            >
              <FileImage className="mr-2 h-4 w-4" />
              PNG
            </Button>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEditCategory(category)}>
                <Edit className="mr-2 h-4 w-4" />
                Edytuj kategorię
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDeleteCategory(category)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Usuń kategorię
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default PricingCategoryHeader;
