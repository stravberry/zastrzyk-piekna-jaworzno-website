
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, Image } from "lucide-react";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";

import AdminLayout from "@/components/admin/AdminLayout";
import AdminProtectedRoute from "@/components/admin/AdminProtectedRoute";
import { getBlogPostById, createBlogPost, updateBlogPost } from "@/services/blogService";
import { BlogPostDraft } from "@/types/admin";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  excerpt: z.string().min(10, "Excerpt must be at least 10 characters"),
  content: z.string().min(50, "Content must be at least 50 characters"),
  category: z.string().min(1, "Category is required"),
  image: z.string().url("Image must be a valid URL"),
  readTime: z.string().min(1, "Reading time is required"),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  keywords: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const AdminPostEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = id !== undefined;
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      excerpt: "",
      content: "",
      category: "",
      image: "",
      readTime: "5 min",
      metaTitle: "",
      metaDescription: "",
      keywords: "",
    }
  });
  
  const [previewData, setPreviewData] = useState<FormValues | null>(null);
  
  // Fetch post data if editing
  const { data: post, isLoading: isLoadingPost } = useQuery({
    queryKey: ["blogPost", id],
    queryFn: () => getBlogPostById(Number(id)),
    enabled: isEditing,
  });
  
  // Set form values when post data is loaded
  useEffect(() => {
    if (post && isEditing) {
      form.reset({
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        category: post.category,
        image: post.image,
        readTime: post.readTime,
        metaTitle: post.seo?.metaTitle || post.title,
        metaDescription: post.seo?.metaDescription || post.excerpt,
        keywords: post.seo?.keywords?.join(", ") || post.category,
      });
      setPreviewData({
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        category: post.category,
        image: post.image,
        readTime: post.readTime,
        metaTitle: post.seo?.metaTitle || post.title,
        metaDescription: post.seo?.metaDescription || post.excerpt,
        keywords: post.seo?.keywords?.join(", ") || post.category,
      });
    }
  }, [post, isEditing, form]);
  
  // Create post mutation
  const createMutation = useMutation({
    mutationFn: (data: BlogPostDraft) => createBlogPost(data),
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Post created successfully",
      });
      navigate("/admin/posts");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
    },
  });
  
  // Update post mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: BlogPostDraft }) => 
      updateBlogPost(id, data),
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Post updated successfully",
      });
      navigate("/admin/posts");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update post",
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: FormValues) => {
    const postData: BlogPostDraft = {
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
      category: data.category,
      image: data.image,
      readTime: data.readTime,
      slug: "",
      seo: {
        metaTitle: data.metaTitle || data.title,
        metaDescription: data.metaDescription || data.excerpt,
        keywords: data.keywords ? data.keywords.split(",").map(k => k.trim()) : [],
      }
    };
    
    if (isEditing && id) {
      updateMutation.mutate({ id: Number(id), data: postData });
    } else {
      createMutation.mutate(postData);
    }
  };
  
  const handlePreview = () => {
    const data = form.getValues();
    setPreviewData(data);
  };
  
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <AdminProtectedRoute>
      <AdminLayout title={isEditing ? "Edit Post" : "Create New Post"}>
        <Tabs defaultValue="editor" className="w-full">
          <div className="flex justify-between items-center mb-6">
            <TabsList>
              <TabsTrigger value="editor">Editor</TabsTrigger>
              <TabsTrigger value="preview" onClick={handlePreview}>Preview</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
            </TabsList>
            
            <Button
              onClick={form.handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className="bg-pink-500 hover:bg-pink-600"
            >
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? "Saving..." : "Save Post"}
            </Button>
          </div>
          
          <Form {...form}>
            <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
              <TabsContent value="editor" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="col-span-3 md:col-span-2">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter post title" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="excerpt"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Excerpt</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Brief description of the post" 
                                  className="min-h-[80px]"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="content"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Content</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Write your post content here..." 
                                  className="min-h-[300px]"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="col-span-3 md:col-span-1">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="image"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Featured Image URL</FormLabel>
                              <FormControl>
                                <div className="space-y-2">
                                  <Input placeholder="https://example.com/image.jpg" {...field} />
                                  {field.value && (
                                    <div className="relative aspect-video mt-2 rounded-md overflow-hidden border">
                                      <img 
                                        src={field.value} 
                                        alt="Preview" 
                                        className="object-cover w-full h-full"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Image+Error";
                                        }}
                                      />
                                    </div>
                                  )}
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
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
                            control={form.control}
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
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="preview">
                {previewData ? (
                  <div className="space-y-6">
                    <Card>
                      <CardContent className="p-6">
                        <div className="prose max-w-none">
                          <div className="mb-6">
                            <h1 className="text-3xl font-bold mb-4">{previewData.title}</h1>
                            <div className="flex items-center gap-4 text-gray-500 text-sm mb-6">
                              <span>{new Date().toLocaleDateString()}</span>
                              <span>•</span>
                              <span>{previewData.category}</span>
                              <span>•</span>
                              <span>{previewData.readTime} read</span>
                            </div>
                            <p className="text-xl text-gray-600">{previewData.excerpt}</p>
                          </div>
                          
                          {previewData.image && (
                            <div className="mb-6">
                              <img 
                                src={previewData.image} 
                                alt={previewData.title} 
                                className="w-full max-h-[400px] object-cover rounded-lg"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "https://placehold.co/800x400?text=Image+Error";
                                }}
                              />
                            </div>
                          )}
                          
                          <div dangerouslySetInnerHTML={{ __html: previewData.content }} />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Image className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium mb-2">No preview available</h3>
                    <p>Fill in the form fields and click "Preview" to see how your post will look</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="seo">
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="metaTitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Meta Title</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="SEO title (defaults to post title)" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="metaDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Meta Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="SEO description (defaults to excerpt)" 
                                className="min-h-[80px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="keywords"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Keywords (comma-separated)</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="e.g. skincare, anti-aging, beauty" 
                                className="min-h-[80px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="mt-6">
                        <h3 className="text-sm font-medium mb-2">Search Preview</h3>
                        <div className="border rounded-md p-4 bg-white">
                          <div className="text-blue-600 text-lg font-medium truncate">
                            {form.watch("metaTitle") || form.watch("title") || "Post Title"}
                          </div>
                          <div className="text-green-600 text-sm truncate">
                            {window.location.origin}/blog/post-slug
                          </div>
                          <div className="text-gray-600 text-sm mt-1 line-clamp-2">
                            {form.watch("metaDescription") || form.watch("excerpt") || "Post description will appear here..."}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </form>
          </Form>
        </Tabs>
      </AdminLayout>
    </AdminProtectedRoute>
  );
};

export default AdminPostEditor;
