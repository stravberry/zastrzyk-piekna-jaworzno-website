
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PriceCategory } from "@/components/pricing/PriceCard";
import { addCategory, updateCategory } from "@/services/pricingService";
import { toast } from "sonner";

const formSchema = z.object({
  title: z.string().min(1, "Tytuł kategorii jest wymagany")
});

type FormData = z.infer<typeof formSchema>;

interface PricingCategoryDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  category?: PriceCategory | null;
  mode: 'add' | 'edit';
}

const PricingCategoryDialog: React.FC<PricingCategoryDialogProps> = ({
  open,
  onClose,
  onSuccess,
  category,
  mode,
}) => {
  const isEditing = mode === 'edit';
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: category?.title || "",
    },
  });

  // Reset form when dialog opens/closes or category changes
  React.useEffect(() => {
    if (open) {
      form.reset({
        title: category?.title || "",
      });
    }
  }, [open, category, form]);
  
  const handleSubmit = async (data: FormData) => {
    try {
      if (isEditing && category) {
        await updateCategory(category.id, { title: data.title });
        toast.success("Kategoria została zaktualizowana");
      } else {
        await addCategory({ title: data.title, items: [] });
        toast.success("Kategoria została dodana");
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error(isEditing 
        ? "Nie udało się zaktualizować kategorii" 
        : "Nie udało się dodać kategorii"
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edytuj kategorię" : "Dodaj nową kategorię"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nazwa kategorii</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Wprowadź nazwę kategorii" 
                      {...field}
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

export default PricingCategoryDialog;
