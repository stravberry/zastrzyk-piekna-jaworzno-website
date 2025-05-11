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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

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
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onChange",
  });
  
  // Update form with defaultValues when they change (when post is loaded)
  React.useEffect(() => {
    if (defaultValues && isEditing) {
      Object.keys(defaultValues).forEach(key => {
        const fieldKey = key as keyof FormValues;
        form.setValue(fieldKey, defaultValues[fieldKey], { shouldValidate: true });
      });
      setPreviewData(defaultValues);
    }
  }, [defaultValues, form, isEditing]);
  
  // Update preview data when form values change
  const handlePreview = () => {
    const data = form.getValues();
    setPreviewData(data);
    setActiveTab("preview");
  };
  
  const handleFormSubmit = (data: FormValues) => {
    console.log("Form submitted with values:", data);
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
  
  const getActiveTabLabel = () => {
    switch(activeTab) {
      case "editor": return "Editor";
      case "preview": return "Preview"; 
      case "seo": return "SEO";
      default: return "Editor";
    }
  };

  // Use Sheet for mobile and Tabs for desktop
  if (isMobile) {
    return (
      <Form {...form}>
        <form 
          id="post-editor-form" 
          className="space-y-4" 
          onSubmit={form.handleSubmit(handleFormSubmit)}
        >
          <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  {getActiveTabLabel()}
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="p-0 pt-6 px-2">
                <div className="mt-2 pb-2">
                  <Tabs value={activeTab} onValueChange={(value) => {
                    setActiveTab(value);
                    if (value === "preview") {
                      handlePreview();
                    }
                    setIsSheetOpen(false);
                  }}>
                    <TabsList className="w-full grid grid-cols-3 mb-4">
                      <TabsTrigger value="editor">Editor</TabsTrigger>
                      <TabsTrigger value="preview">Preview</TabsTrigger>
                      <TabsTrigger value="seo">SEO</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </SheetContent>
            </Sheet>
            
            <Button
              type="submit"
              form="post-editor-form"
              disabled={isSubmitting}
              className="bg-pink-500 hover:bg-pink-600 w-full sm:w-auto"
            >
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? "Zapisywanie..." : "Zapisz Post"}
            </Button>
          </div>
          
          <div className="pt-2">
            {activeTab === "editor" && <EditorMainTab control={form.control} />}
            {activeTab === "preview" && <EditorPreviewTab previewData={previewData} />}
            {activeTab === "seo" && <EditorSEOTab control={form.control} watch={form.watch} />}
          </div>
        </form>
      </Form>
    );
  }
  
  // Desktop view with tabs
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
        <TabsList>
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger 
            value="preview" 
            onClick={handlePreview}
          >
            Preview
          </TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
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
