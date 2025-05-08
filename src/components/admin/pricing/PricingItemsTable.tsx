
import React from "react";
import { Button } from "@/components/ui/button";
import { PriceCategory } from "@/components/pricing/PriceCard";
import { Pencil, Trash2 } from "lucide-react";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from "@/components/ui/table";

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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nazwa zabiegu</TableHead>
          <TableHead>Cena</TableHead>
          <TableHead>Opis</TableHead>
          <TableHead className="text-right w-[100px]">Akcje</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {category.items.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
              Brak zabiegów w tej kategorii
            </TableCell>
          </TableRow>
        ) : (
          category.items.map((item, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell>{item.price}</TableCell>
              <TableCell className="max-w-sm truncate">
                {item.description || "-"}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-1">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onEditItem(category, index)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onDeleteItem(category, index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default PricingItemsTable;
