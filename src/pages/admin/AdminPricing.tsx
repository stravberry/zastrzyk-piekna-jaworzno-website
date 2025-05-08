
import React, { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import AdminLayout from "@/components/admin/AdminLayout";
import { PriceCategory } from "@/components/pricing/PriceCard";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from "@/components/ui/table";
import {
  getPriceCategories,
  resetPriceCategories
} from "@/services/pricingService";
import PricingCategoryDialog from "@/components/admin/pricing/PricingCategoryDialog";
import PricingItemDialog from "@/components/admin/pricing/PricingItemDialog";
import PricingDeleteDialog from "@/components/admin/pricing/PricingDeleteDialog";

const AdminPricing = () => {
  const [categories, setCategories] = useState<PriceCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<PriceCategory | null>(null);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
  const [dialogType, setDialogType] = useState<'addCategory' | 'editCategory' | 'addItem' | 'editItem' | 'deleteCategory' | 'deleteItem' | null>(null);
  
  // Load categories
  useEffect(() => {
    setCategories(getPriceCategories());
    setIsLoading(false);
  }, []);

  // Refresh data
  const refreshData = () => {
    setCategories(getPriceCategories());
  };

  // Handle dialog close
  const handleCloseDialog = () => {
    setDialogType(null);
    setSelectedCategory(null);
    setSelectedItemIndex(null);
  };

  // Handle adding a new category
  const handleAddCategory = () => {
    setDialogType('addCategory');
    setSelectedCategory(null);
  };

  // Handle editing a category
  const handleEditCategory = (category: PriceCategory) => {
    setSelectedCategory(category);
    setDialogType('editCategory');
  };

  // Handle deleting a category
  const handleDeleteCategory = (category: PriceCategory) => {
    setSelectedCategory(category);
    setDialogType('deleteCategory');
  };

  // Handle adding an item
  const handleAddItem = (category: PriceCategory) => {
    setSelectedCategory(category);
    setDialogType('addItem');
  };

  // Handle editing an item
  const handleEditItem = (category: PriceCategory, itemIndex: number) => {
    setSelectedCategory(category);
    setSelectedItemIndex(itemIndex);
    setDialogType('editItem');
  };

  // Handle deleting an item
  const handleDeleteItem = (category: PriceCategory, itemIndex: number) => {
    setSelectedCategory(category);
    setSelectedItemIndex(itemIndex);
    setDialogType('deleteItem');
  };

  // Handle resetting data
  const handleResetData = () => {
    if (confirm("Czy na pewno chcesz zresetować wszystkie dane cennika do wartości początkowych?")) {
      resetPriceCategories();
      refreshData();
      toast({
        title: "Dane zostały zresetowane",
        description: "Cennik został przywrócony do wartości początkowych"
      });
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Zarządzanie cennikiem">
        <div className="p-4">Ładowanie danych...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Zarządzanie cennikiem">
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Button onClick={handleAddCategory} variant="default" className="mr-2">
              <Plus className="mr-1" /> Dodaj kategorię
            </Button>
            <Button onClick={handleResetData} variant="outline" className="ml-2">
              Resetuj dane
            </Button>
          </div>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Nie znaleziono żadnych kategorii w cenniku</p>
            <Button onClick={handleAddCategory}>
              <Plus className="mr-1" /> Dodaj pierwszą kategorię
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {categories.map((category) => (
              <div key={category.id} className="border rounded-lg overflow-hidden">
                <div className="bg-pink-50 p-4 flex justify-between items-center">
                  <h3 className="text-lg font-semibold">{category.title}</h3>
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleAddItem(category)}
                    >
                      <Plus className="mr-1 h-4 w-4" /> Dodaj usługę
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEditCategory(category)}
                    >
                      <Pencil className="mr-1 h-4 w-4" /> Edytuj kategorię
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteCategory(category)}
                    >
                      <Trash2 className="mr-1 h-4 w-4" /> Usuń
                    </Button>
                  </div>
                </div>

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
                                onClick={() => handleEditItem(category, index)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDeleteItem(category, index)}
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
              </div>
            ))}
          </div>
        )}

        {/* Dialogs */}
        <PricingCategoryDialog
          open={dialogType === 'addCategory' || dialogType === 'editCategory'}
          onClose={handleCloseDialog}
          onSuccess={refreshData}
          category={selectedCategory}
          mode={dialogType === 'addCategory' ? 'add' : 'edit'}
        />

        <PricingItemDialog
          open={dialogType === 'addItem' || dialogType === 'editItem'}
          onClose={handleCloseDialog}
          onSuccess={refreshData}
          category={selectedCategory}
          item={selectedCategory && selectedItemIndex !== null ? selectedCategory.items[selectedItemIndex] : undefined}
          itemIndex={selectedItemIndex}
          mode={dialogType === 'addItem' ? 'add' : 'edit'}
        />

        <PricingDeleteDialog
          open={dialogType === 'deleteCategory' || dialogType === 'deleteItem'}
          onClose={handleCloseDialog}
          onSuccess={refreshData}
          category={selectedCategory}
          itemIndex={selectedItemIndex}
          type={dialogType === 'deleteCategory' ? 'category' : 'item'}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminPricing;
