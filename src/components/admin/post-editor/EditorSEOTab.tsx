
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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { FormValues } from "./formSchema";

interface EditorSEOTabProps {
  control: Control<FormValues>;
  watch: any;
}

export const EditorSEOTab: React.FC<EditorSEOTabProps> = ({ control, watch }) => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-2 sm:p-6">
        <div className="space-y-2 sm:space-y-4">
          <FormField
            control={control}
            name="metaTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs sm:text-sm">Meta Title</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="SEO title (defaults to post title)" 
                    {...field} 
                    className="text-xs sm:text-sm"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={control}
            name="metaDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs sm:text-sm">Meta Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="SEO description (defaults to excerpt)" 
                    className="min-h-[80px] text-xs sm:text-sm"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={control}
            name="keywords"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs sm:text-sm">Keywords (comma-separated)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="e.g. skincare, anti-aging, beauty" 
                    className="min-h-[80px] text-xs sm:text-sm"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Hide search preview on mobile, show only on sm breakpoint and above */}
          <div className="hidden sm:block mt-2 sm:mt-6">
            <h3 className="text-xs sm:text-sm font-medium mb-1 sm:mb-2">Search Preview</h3>
            <div className="border rounded-md p-2 sm:p-4 bg-white">
              <div className="text-blue-600 text-xs sm:text-lg font-medium">
                {watch("metaTitle") || watch("title") || "Post Title"}
              </div>
              <div className="text-green-600 text-2xs sm:text-xs overflow-hidden break-all">
                {window.location.origin}/blog/post-slug
              </div>
              <div className="text-gray-600 text-2xs sm:text-sm mt-1 break-words">
                {watch("metaDescription") || watch("excerpt") || "Post description will appear here..."}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
