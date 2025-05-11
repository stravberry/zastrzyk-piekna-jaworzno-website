
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
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";

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
  
  // Use Drawer for mobile and Tabs for desktop
  if (isMobile) {
    return (
      <Form {...form}>
        <form 
          id="post-editor-form" 
          className="space-y-6" 
          onSubmit={form.handleSubmit(handleFormSubmit)}
        >
          <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
            <Drawer>
              <DrawerTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto mb-3">
                  {activeTab === "editor" ? "Editor" : activeTab === "preview" ? "Preview" : "SEO"}
                </Button>
              </DrawerTrigger>
              <DrawerContent className="px-4 pb-6">
                <div className="mt-6 space-y-6">
                  <TabsList className="w-full grid grid-cols-3">
                    <TabsTrigger 
                      value="editor" 
                      onClick={() => setActiveTab("editor")}
                      className={activeTab === "editor" ? "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground" : ""}
                    >
                      Editor
                    </TabsTrigger>
                    <TabsTrigger 
                      value="preview" 
                      onClick={() => {
                        handlePreview();
                        setActiveTab("preview");
                      }}
                      className={activeTab === "preview" ? "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground" : ""}
                    >
                      Preview
                    </TabsTrigger>
                    <TabsTrigger 
                      value="seo" 
                      onClick={() => setActiveTab("seo")}
                      className={activeTab === "seo" ? "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground" : ""}
                    >
                      SEO
                    </TabsTrigger>
                  </TabsList>
                </div>
              </DrawerContent>
            </Drawer>
            
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
          
          <div className="pt-4">
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
