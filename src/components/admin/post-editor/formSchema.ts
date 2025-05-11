
import { z } from "zod";

export const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  excerpt: z.string().min(10, "Excerpt must be at least 10 characters"),
  content: z.string().min(50, "Content must be at least 50 characters"),
  category: z.string().min(1, "Category is required"),
  image: z.string().optional(),
  readTime: z.string().min(1, "Reading time is required"),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  keywords: z.string().optional(),
});

export type FormValues = z.infer<typeof formSchema>;

export const getDefaultFormValues = () => ({
  title: "",
  excerpt: "",
  content: "",
  category: "",
  image: "",
  readTime: "5 min",
  metaTitle: "",
  metaDescription: "",
  keywords: "",
});
