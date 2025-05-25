
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PriceCategory, PriceItem } from "@/components/pricing/PriceCard";
import { addItemToCategory, updateItemInCategory } from "@/services/pricing";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ServiceBadge, { BadgeType } from "@/components/pricing/ServiceBadge";

const formSchema = z.object({
  name: z.string().min(1, "Nazwa usługi jest wymagana"),
  price: z.string().min(1, "Cena jest wymagana"),
  description: z.string().optional(),
  categoryId: z.string().min(1, "Kategoria jest wymagana"),
  badge: z.enum(["promotion", "new", "none"]).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface PricingItemDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  category: PriceCategory | null;
  item?: PriceItem;
  itemIndex: number | null;
  mode: 'add' | 'edit';
  allCategories: PriceCategory[];
}

const PricingItemDialog: React.FC<PricingItemDialogProps> = ({
  open,
  onClose,
  onSuccess,
  category,
  item,
  itemIndex,
  mode,
  allCategories,
}) => {
  const isEditing = mode === 'edit';
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: item?.name || "",
      price: item?.price || "",
      description: item?.description || "",
      categoryId: category?.id || "",
      badge: item?.badge || "none",
    },
  });

  // Reset form when dialog opens/closes or item changes
  React.useEffect(() => {
    if (open) {
      form.reset({
        name: item?.name || "",
        price: item?.price || "",
        description: item?.description || "",
        categoryId: category?.id || "",
        badge: item?.badge || "none",
      });
    }
  }, [open, item, category, form]);
  
  const handleSubmit = async (data: FormData) => {
    const selectedCategoryId = data.categoryId;
    
    if (!selectedCategoryId) {
      toast.error("Wybierz kategorię");
      return;
    }
    
    try {
      const itemData: PriceItem = {
        name: data.name,
        price: data.price,
        ...(data.description ? { description: data.description } : {}),
        ...(data.badge && data.badge !== "none" ? { badge: data.badge as BadgeType } : {}),
      };
      
      if (isEditing && typeof itemIndex === 'number') {
        // If user changed the category, we need special handling
        if (category && selectedCategoryId !== category.id) {
          // First add to new category
          await addItemToCategory(selectedCategoryId, itemData);
          // Then delete from old category
          await updateItemInCategory(category.id, itemIndex, { ...itemData, _toDelete: true });
          toast.success("Usługa została przeniesiona do innej kategorii");
        } else {
          // Regular update in same category
          await updateItemInCategory(selectedCategoryId, itemIndex, itemData);
          toast.success("Usługa została zaktualizowana");
        }
      } else {
        await addItemToCategory(selectedCategoryId, itemData);
        toast.success("Usługa została dodana");
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving item:", error);
      toast.error(isEditing 
        ? "Nie udało się zaktualizować usługi" 
        : "Nie udało się dodać usługi"
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edytuj usługę" : "Dodaj nową usługę"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategoria</FormLabel>
                  <FormControl>
                    <Select 
                      value={field.value} 
                      onValueChange={field.onChange}
                      disabled={isEditing && !allCategories.length}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Wybierz kategorię" />
                      </SelectTrigger>
                      <SelectContent>
                        {allCategories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nazwa usługi</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Wprowadź nazwę usługi" 
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cena</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="np. 100 zł" 
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="badge"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Etykieta promocyjna</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Wybierz etykietę (opcjonalnie)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Brak etykiety</SelectItem>
                        <SelectItem value="promotion">
                          <div className="flex items-center gap-2">
                            <ServiceBadge badge="promotion" size="sm" />
                            Super promocja
                          </div>
                        </SelectItem>
                        <SelectItem value="new">
                          <div className="flex items-center gap-2">
                            <ServiceBadge badge="new" size="sm" />
                            Nowość
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Opis (opcjonalnie)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Wprowadź dodatkowy opis usługi" 
                      {...field}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Anuluj
              </Button>
              <Button 
                type="submit" 
                disabled={form.formState.isSubmitting}
                className="bg-pink-500 hover:bg-pink-600"
              >
                {form.formState.isSubmitting 
                  ? "Zapisywanie..." 
                  : isEditing ? "Zaktualizuj" : "Dodaj"
                }
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PricingItemDialog;
