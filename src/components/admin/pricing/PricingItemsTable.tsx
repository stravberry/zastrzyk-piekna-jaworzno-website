
import React from "react";
import { Button } from "@/components/ui/button";
import { PriceCategory } from "@/components/pricing/PriceCard";
import { Edit, Trash2 } from "lucide-react";

interface PricingItemsTableProps {
  category: PriceCategory;
  onEditItem: (category: PriceCategory, itemIndex: number) => void;
  onDeleteItem: (category: PriceCategory, itemIndex: number) => void;
}

const PricingItemsTable: React.FC<PricingItemsTableProps> = ({
  category,
  onEditItem,
  onDeleteItem,
}) => {
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
