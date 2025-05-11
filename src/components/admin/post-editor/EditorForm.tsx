
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form } from "@/components/ui/form";
import { useIsMobile } from "@/hooks/use-mobile";
import { BlogPostDraft } from "@/types/admin";
import { FormValues, formSchema } from "./formSchema";
import { EditorMainTab } from "./EditorMainTab";
import { EditorPreviewTab } from "./EditorPreviewTab";
import { EditorSEOTab } from "./EditorSEOTab";

interface EditorFormProps {
  defaultValues: FormValues;
  isSubmitting: boolean;
  onSubmit: (data: BlogPostDraft) => void;
  post?: any;
  isEditing: boolean;
}

export const EditorForm: React.FC<EditorFormProps> = ({
  defaultValues,
  isSubmitting,
  onSubmit,
  isEditing,
}) => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = React.useState("editor");
  const [previewData, setPreviewData] = React.useState<FormValues | null>(defaultValues || null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  
  // Update preview data when form values change
  const handlePreview = () => {
    const data = form.getValues();
    setPreviewData(data);
    setActiveTab("preview");
  };
  
  const handleFormSubmit = (data: FormValues) => {
    const postData: BlogPostDraft = {
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
      category: data.category,
      image: data.image || "",
      readTime: data.readTime,
      slug: "",
      seo: {
        metaTitle: data.metaTitle || data.title,
        metaDescription: data.metaDescription || data.excerpt,
        keywords: data.keywords ? data.keywords.split(",").map(k => k.trim()) : [],
      }
    };
    
    // Call the onSubmit handler passed from the parent component
    onSubmit(postData);
  };
  
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
        <TabsList className={isMobile ? "w-full" : ""}>
          <TabsTrigger value="editor" className={isMobile ? "flex-1" : ""}>Editor</TabsTrigger>
          <TabsTrigger 
            value="preview" 
            className={isMobile ? "flex-1" : ""} 
            onClick={handlePreview}
          >
            Preview
          </TabsTrigger>
          <TabsTrigger value="seo" className={isMobile ? "flex-1" : ""}>SEO</TabsTrigger>
        </TabsList>
        
        <Button
          type="submit"
          form="post-editor-form"
          disabled={isSubmitting}
          className="bg-pink-500 hover:bg-pink-600 w-full sm:w-auto mt-2 sm:mt-0"
        >
          <Save className="mr-2 h-4 w-4" />
          {isSubmitting ? "Zapisywanie..." : "Zapisz Post"}
        </Button>
      </div>
      
      <Form {...form}>
        <form 
          id="post-editor-form" 
          className="space-y-6" 
          onSubmit={form.handleSubmit(handleFormSubmit)}
        >
          <TabsContent value="editor">
            <EditorMainTab control={form.control} />
          </TabsContent>
          
          <TabsContent value="preview">
            <EditorPreviewTab previewData={previewData} />
          </TabsContent>
          
          <TabsContent value="seo">
            <EditorSEOTab control={form.control} watch={form.watch} />
          </TabsContent>
        </form>
      </Form>
    </Tabs>
  );
};
