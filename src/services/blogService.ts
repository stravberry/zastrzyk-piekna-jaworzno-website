
import { supabase } from "@/integrations/supabase/client";
import { BlogPost, BlogPostDraft, BlogPostStats } from "@/types/admin";

// Utility function to convert database blog post to frontend model
const mapDbPostToFrontend = (dbPost: any): BlogPost => {
  return {
    id: dbPost.id,
    title: dbPost.title,
    excerpt: dbPost.excerpt,
    content: dbPost.content,
    category: dbPost.category,
    image: dbPost.image,
    readTime: dbPost.read_time,
    date: new Date(dbPost.date).toLocaleDateString('pl-PL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }),
    slug: dbPost.slug || `/blog/${dbPost.id}`,
    seo: {
      metaTitle: dbPost.meta_title || dbPost.title,
      metaDescription: dbPost.meta_description || dbPost.excerpt,
      keywords: dbPost.keywords || [dbPost.category],
    },
    stats: {
      id: dbPost.id,
      views: Math.floor(Math.random() * 1000) + 100, // Mock stats for now
      clicks: Math.floor(Math.random() * 200) + 20,
      timeSpent: Math.floor(Math.random() * 180) + 60,
    }
  };
};

// Get all blog posts
export const getAllBlogPosts = async (): Promise<BlogPost[]> => {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching blog posts:', error);
    throw error;
  }

  return data.map(mapDbPostToFrontend);
};

// Get a single blog post by ID
export const getBlogPostById = async (id: number): Promise<BlogPost | undefined> => {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching blog post:', error);
    return undefined;
  }

  return mapDbPostToFrontend(data);
};

// Create a new blog post
export const createBlogPost = async (postData: BlogPostDraft): Promise<BlogPost> => {
  // Extract keywords array from comma-separated string if needed
  const keywords = typeof postData.seo?.keywords === 'string' 
    ? postData.seo.keywords.split(',').map(k => k.trim()) 
    : postData.seo?.keywords || [];

  // Generate slug from title
  const slug = `/blog/${postData.title.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-')}`;

  const { data, error } = await supabase
    .from('blog_posts')
    .insert({
      title: postData.title,
      excerpt: postData.excerpt,
      content: postData.content,
      category: postData.category,
      image: postData.image,
      read_time: postData.readTime,
      slug: slug,
      meta_title: postData.seo?.metaTitle,
      meta_description: postData.seo?.metaDescription,
      keywords: keywords,
      author_id: (await supabase.auth.getUser()).data.user?.id
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating blog post:', error);
    throw error;
  }

  return mapDbPostToFrontend(data);
};

// Update an existing blog post
export const updateBlogPost = async (id: number, postData: Partial<BlogPostDraft>): Promise<BlogPost | undefined> => {
  // Prepare update data
  const updateData: any = {};
  
  if (postData.title) updateData.title = postData.title;
  if (postData.excerpt) updateData.excerpt = postData.excerpt;
  if (postData.content) updateData.content = postData.content;
  if (postData.category) updateData.category = postData.category;
  if (postData.image) updateData.image = postData.image;
  if (postData.readTime) updateData.read_time = postData.readTime;
  
  // Update slug if title changed
  if (postData.title) {
    updateData.slug = `/blog/${postData.title.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-')}`;
  }
  
  // Update SEO fields
  if (postData.seo?.metaTitle) updateData.meta_title = postData.seo.metaTitle;
  if (postData.seo?.metaDescription) updateData.meta_description = postData.seo.metaDescription;
  
  // Handle keywords
  if (postData.seo?.keywords) {
    updateData.keywords = typeof postData.seo.keywords === 'string'
      ? postData.seo.keywords.split(',').map(k => k.trim())
      : postData.seo.keywords;
  }
  
  const { data, error } = await supabase
    .from('blog_posts')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating blog post:', error);
    return undefined;
  }

  return mapDbPostToFrontend(data);
};

// Delete a blog post
export const deleteBlogPost = async (id: number): Promise<boolean> => {
  const { error } = await supabase
    .from('blog_posts')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting blog post:', error);
    return false;
  }

  return true;
};

// Get blog statistics
export const getBlogStats = async (): Promise<{
  totalPosts: number;
  totalViews: number;
  popularCategories: {category: string, count: number}[];
  recentPosts: BlogPost[];
}> => {
  // Get all posts to calculate stats
  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select('*');

  if (error) {
    console.error('Error fetching posts for stats:', error);
    throw error;
  }

  // Calculate categories
  const categoryCount: Record<string, number> = {};
  posts.forEach(post => {
    if (categoryCount[post.category]) {
      categoryCount[post.category]++;
    } else {
      categoryCount[post.category] = 1;
    }
  });
  
  // Get popular categories
  const popularCategories = Object.entries(categoryCount)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  
  // Get recent posts
  const recentPosts = posts
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
    .map(mapDbPostToFrontend);
  
  // Mock total views for now
  const totalViews = posts.length * (Math.floor(Math.random() * 500) + 100);
  
  return {
    totalPosts: posts.length,
    totalViews,
    popularCategories,
    recentPosts,
  };
};
