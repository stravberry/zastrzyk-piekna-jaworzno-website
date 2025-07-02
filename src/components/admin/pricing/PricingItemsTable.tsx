
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
import ServiceBadge from "@/components/pricing/ServiceBadge";

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
      <div className="px-3 py-2">
        {category.items.length === 0 ? (
          <div className="py-6 text-center text-gray-500 italic text-sm">
            Brak usług w tej kategorii. Dodaj pierwszą usługę klikając przycisk "Dodaj usługę".
          </div>
        ) : (
          <div className="space-y-3 max-w-full">
            {category.items.map((item, index) => (
              <div 
                key={index} 
                className={`py-4 px-3 rounded-lg ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <h4 className="font-medium text-sm leading-tight break-words">{item.name}</h4>
                      {item.badge && <ServiceBadge badge={item.badge} size="sm" />}
                    </div>
                    <div className="text-pink-600 font-semibold text-base mb-2">{item.price}</div>
                    {item.description && (
                      <p className="text-gray-600 text-sm leading-relaxed break-words">{item.description}</p>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white min-w-[150px] z-50">
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
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-gray-700 text-sm font-medium">Nazwa</th>
            <th className="px-4 py-3 text-left text-gray-700 text-sm font-medium">Cena</th>
            <th className="px-4 py-3 text-left text-gray-700 text-sm font-medium">Etykieta</th>
            <th className="px-4 py-3 text-left text-gray-700 text-sm font-medium">Opis</th>
            <th className="px-4 py-3 text-right text-gray-700 text-sm font-medium">Akcje</th>
          </tr>
        </thead>
        <tbody>
          {category.items.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-6 text-center text-gray-500 italic">
                Brak usług w tej kategorii. Dodaj pierwszą usługę klikając przycisk "Dodaj usługę".
              </td>
            </tr>
          ) : (
            category.items.map((item, index) => (
              <tr key={index} className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100 transition-colors`}>
                <td className="px-4 py-4 text-sm font-medium">{item.name}</td>
                <td className="px-4 py-4 text-pink-600 font-semibold text-sm">{item.price}</td>
                <td className="px-4 py-4">
                  {item.badge ? (
                    <ServiceBadge badge={item.badge} size="sm" />
                  ) : (
                    <span className="text-gray-400 italic text-sm">Brak</span>
                  )}
                </td>
                <td className="px-4 py-4 text-gray-600 text-sm max-w-xs">
                  <div className="break-words">
                    {item.description || <span className="text-gray-400 italic">Brak opisu</span>}
                  </div>
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditItem(category, index)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
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
