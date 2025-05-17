
import React from "react";
import { Button } from "@/components/ui/button";
import { PriceCategory } from "@/components/pricing/PriceCard";
import { Edit, Trash2, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PricingItemsTableProps {
  category: PriceCategory;
  onEditItem: (category: PriceCategory, itemIndex: number) => void;
  onDeleteItem: (category: PriceCategory, itemIndex: number) => void;
  isMobile?: boolean;
}

const PricingItemsTable: React.FC<PricingItemsTableProps> = ({
  category,
  onEditItem,
  onDeleteItem,
  isMobile = false,
}) => {
  if (isMobile) {
    return (
      <div className="px-2">
        {category.items.length === 0 ? (
          <div className="py-4 text-center text-gray-500 italic text-sm">
            Brak usług w tej kategorii. Dodaj pierwszą usługę klikając przycisk "Dodaj usługę".
          </div>
        ) : (
          category.items.map((item, index) => (
            <div 
              key={index} 
              className={`py-3 px-2 ${index !== category.items.length - 1 ? 'border-b' : ''}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-grow pr-2">
                  <h4 className="font-medium">{item.name}</h4>
                  <div className="text-pink-600 font-medium text-sm">{item.price}</div>
                  {item.description && (
                    <p className="text-gray-600 text-xs mt-1">{item.description}</p>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEditItem(category, index)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edytuj
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDeleteItem(category, index)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Usuń
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))
        )}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-gray-700">Nazwa</th>
            <th className="px-4 py-3 text-left text-gray-700">Cena</th>
            <th className="px-4 py-3 text-left text-gray-700">Opis</th>
            <th className="px-4 py-3 text-right text-gray-700">Akcje</th>
          </tr>
        </thead>
        <tbody>
          {category.items.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-4 py-3 text-center text-gray-500 italic">
                Brak usług w tej kategorii. Dodaj pierwszą usługę klikając przycisk "Dodaj usługę".
              </td>
            </tr>
          ) : (
            category.items.map((item, index) => (
              <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="px-4 py-3">{item.name}</td>
                <td className="px-4 py-3 text-pink-600 font-medium">{item.price}</td>
                <td className="px-4 py-3 text-gray-600 text-sm">
                  {item.description || <span className="text-gray-400 italic">Brak opisu</span>}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditItem(category, index)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => onDeleteItem(category, index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PricingItemsTable;
