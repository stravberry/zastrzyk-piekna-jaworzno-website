
import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PriceCategory } from "@/components/pricing/PriceCard";
import { addCategory, updateCategory } from "@/services/pricingService";
import { toast } from "@/hooks/use-toast";

const formSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, "Tytuł musi mieć minimum 3 znaki"),
});

type PricingCategoryDialogProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  category: PriceCategory | null;
  mode: "add" | "edit";
};

const PricingCategoryDialog: React.FC<PricingCategoryDialogProps> = ({
  open,
  onClose,
  onSuccess,
  category,
  mode,
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: category?.id || "",
      title: category?.title || "",
    },
  });

  // Reset form when category changes
  React.useEffect(() => {
    if (category) {
      form.reset({
        id: category.id,
        title: category.title,
      });
    } else {
      form.reset({
        id: "",
        title: "",
      });
    }
  }, [category, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    try {
      if (mode === "add") {
        // Add new category
        addCategory({
          title: values.title,
          items: [],
        });
        toast({
          title: "Kategoria dodana",
          description: `Kategoria "${values.title}" została dodana do cennika.`,
        });
      } else {
        // Update existing category
        if (category) {
          updateCategory(category.id, {
            title: values.title,
          });
          toast({
            title: "Kategoria zaktualizowana",
            description: `Kategoria "${values.title}" została zaktualizowana.`,
          });
        }
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving category:", error);
      toast({
        title: "Błąd",
        description: "Wystąpił błąd podczas zapisywania kategorii.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Dodaj nową kategorię" : "Edytuj kategorię"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nazwa kategorii</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Np. Mezoterapia igłowa" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Anuluj
              </Button>
              <Button type="submit">
                {mode === "add" ? "Dodaj kategorię" : "Zapisz zmiany"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PricingCategoryDialog;
