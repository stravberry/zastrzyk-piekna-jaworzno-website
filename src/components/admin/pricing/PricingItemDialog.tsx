
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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PriceCategory, PriceItem } from "@/components/pricing/PriceCard";
import { addItemToCategory, updateItemInCategory } from "@/services/pricingService";
import { toast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(2, "Nazwa musi mieć minimum 2 znaki"),
  price: z.string().min(1, "Cena jest wymagana"),
  description: z.string().optional(),
});

type PricingItemDialogProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  category: PriceCategory | null;
  item?: PriceItem;
  itemIndex: number | null;
  mode: "add" | "edit";
};

const PricingItemDialog: React.FC<PricingItemDialogProps> = ({
  open,
  onClose,
  onSuccess,
  category,
  item,
  itemIndex,
  mode,
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: item?.name || "",
      price: item?.price || "",
      description: item?.description || "",
    },
  });

  // Reset form when item changes
  React.useEffect(() => {
    if (item) {
      form.reset({
        name: item.name,
        price: item.price,
        description: item.description || "",
      });
    } else {
      form.reset({
        name: "",
        price: "",
        description: "",
      });
    }
  }, [item, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    try {
      if (!category) return;

      const itemData: PriceItem = {
        name: values.name,
        price: values.price,
        description: values.description || undefined,
      };

      if (mode === "add") {
        // Add new item
        addItemToCategory(category.id, itemData);
        toast({
          title: "Zabieg dodany",
          description: `Zabieg "${values.name}" został dodany do kategorii "${category.title}".`,
        });
      } else {
        // Update existing item
        if (itemIndex !== null) {
          updateItemInCategory(category.id, itemIndex, itemData);
          toast({
            title: "Zabieg zaktualizowany",
            description: `Zabieg "${values.name}" został zaktualizowany.`,
          });
        }
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving item:", error);
      toast({
        title: "Błąd",
        description: "Wystąpił błąd podczas zapisywania zabiegu.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Dodaj nowy zabieg" : "Edytuj zabieg"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nazwa zabiegu</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Np. Sculptra (1 amp.)" />
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
                    <Input {...field} placeholder="Np. 1800 zł" />
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
                      {...field}
                      placeholder="Krótki opis zabiegu (opcjonalnie)"
                    />
                  </FormControl>
                  <FormDescription>
                    Dodatkowy opis wyświetlany pod nazwą zabiegu
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Anuluj
              </Button>
              <Button type="submit">
                {mode === "add" ? "Dodaj zabieg" : "Zapisz zmiany"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PricingItemDialog;
