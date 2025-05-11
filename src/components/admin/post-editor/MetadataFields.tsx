
import React from "react";
import { Control } from "react-hook-form";
import { 
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FormValues } from "./formSchema";

interface MetadataFieldsProps {
  control: Control<FormValues>;
}

export const MetadataFields: React.FC<MetadataFieldsProps> = ({ control }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <FormField
        control={control}
        name="category"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Category</FormLabel>
            <FormControl>
              <Input placeholder="e.g. Anti-aging" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={control}
        name="readTime"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Read Time</FormLabel>
            <FormControl>
              <Input placeholder="e.g. 5 min" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
