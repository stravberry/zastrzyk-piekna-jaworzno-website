
import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";

import AdminLayout from "@/components/admin/AdminLayout";
import AdminProtectedRoute from "@/components/admin/AdminProtectedRoute";
import { getBlogPostById, createBlogPost, updateBlogPost } from "@/services/blogService";
import { BlogPostDraft } from "@/types/admin";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { EditorForm } from "@/components/admin/post-editor/EditorForm";
import { getDefaultFormValues, FormValues } from "@/components/admin/post-editor/formSchema";
import { BackButton } from "@/components/admin/post-editor/BackButton";

const AdminPostEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = id !== undefined;
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  console.log("Current post id:", id);
  
  // Fetch post data if editing
  const { data: post, isLoading: isLoadingPost, error: postError } = useQuery({
    queryKey: ["blogPost", id],
    queryFn: () => getBlogPostById(Number(id)),
    enabled: isEditing,
    retry: 1,
  });
  
  // Handle error from the query
  React.useEffect(() => {
    if (postError) {
      console.error("Error fetching post:", postError);
      toast({
        title: "Błąd",
        description: "Nie udało się załadować postu",
        variant: "destructive",
      });
    }
  }, [postError, toast]);
  
  console.log("Fetched post data:", post);
  
  // Create post mutation
  const createMutation = useMutation({
    mutationFn: (data: BlogPostDraft) => createBlogPost(data),
    onSuccess: () => {
      toast({
        title: "Sukces!",
        description: "Zapisano post",
        className: "bottom-0 left-0",
      });
      navigate("/admin/posts");
    },
    onError: (error) => {
      console.error("Create post error:", error);
      toast({
        title: "Błąd",
        description: "Nie udało się zapisać postu",
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
        title: "Sukces!",
        description: "Zapisano post",
        className: "bottom-0 left-0",
      });
      navigate("/admin/posts");
    },
    onError: (error) => {
      console.error("Update post error:", error);
      toast({
        title: "Błąd",
        description: "Nie udało się zaktualizować postu",
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission
  const handleSubmit = (postData: BlogPostDraft) => {
    console.log("Submitting post data:", postData);
    if (isEditing && id) {
      updateMutation.mutate({ id: Number(id), data: postData });
    } else {
      createMutation.mutate(postData);
    }
  };
  
  // Get default form values from post data if editing
  const getFormValuesFromPost = (): FormValues => {
    if (!post) return getDefaultFormValues();
    
    return {
      title: post.title || "",
      excerpt: post.excerpt || "",
      content: post.content || "",
      category: post.category || "",
      image: post.image || "",
      readTime: post.readTime || "5 min",
      metaTitle: post.seo?.metaTitle || post.title || "",
      metaDescription: post.seo?.metaDescription || post.excerpt || "",
      keywords: post.seo?.keywords?.join(", ") || post.category || "",
    };
  };
  
  const defaultValues = isEditing ? getFormValuesFromPost() : getDefaultFormValues();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <AdminProtectedRoute>
      <AdminLayout title={isEditing ? "Edit Post" : "Create New Post"}>
        {isMobile && (
          <div className="mb-4">
            <BackButton />
          </div>
        )}
        
        <EditorForm
          defaultValues={defaultValues}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          post={post}
          isEditing={isEditing}
        />
      </AdminLayout>
    </AdminProtectedRoute>
  );
};

export default AdminPostEditor;
