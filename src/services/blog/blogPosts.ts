
import { supabase } from "@/integrations/supabase/client";
import { BlogPost, BlogPostDraft } from "@/types/admin";
import { blogPosts } from "@/data/blogData";
import { mapDbPostToFrontend, seedBlogPosts } from "./blogCore";
import { incrementBlogPostViews, getAllPostViews } from "./blogViews";

// Get all blog posts
export const getAllBlogPosts = async (): Promise<BlogPost[]> => {
  try {
    // Try to seed sample posts first
    await seedBlogPosts();
    
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching blog posts:', error);
      throw error;
    }

    // Get all view counts
    const viewsMap = await getAllPostViews();

    return data.map(post => {
      const mappedPost = mapDbPostToFrontend(post);
      // Use real view count from database
      if (mappedPost.stats) {
        mappedPost.stats.views = viewsMap[post.id] || 0;
      }
      return mappedPost;
    });
  } catch (error) {
    console.error('Error in getAllBlogPosts:', error);
    // Fall back to sample data if database access fails
    return blogPosts.map(post => ({
      ...post,
      content: `<p>${post.excerpt}</p><p>Lorem ipsum dolor sit amet...</p>`,
      seo: {
        metaTitle: post.title,
        metaDescription: post.excerpt,
        keywords: [post.category],
      },
      stats: {
        id: post.id,
        views: 0, // Use 0 instead of random for fallback
        clicks: Math.floor(Math.random() * 200) + 20,
        timeSpent: Math.floor(Math.random() * 180) + 60,
      }
    }));
  }
};

// Get a single blog post by ID and increment view count
export const getBlogPostById = async (id: number): Promise<BlogPost | null> => {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching blog post:', error);
      throw error;
    }

    if (!data) return null;

    // Increment view count when post is accessed
    await incrementBlogPostViews(id);

    const mappedPost = mapDbPostToFrontend(data);
    
    // Get updated view count after increment
    const viewsMap = await getAllPostViews();
    if (mappedPost.stats) {
      mappedPost.stats.views = viewsMap[id] || 0;
    }

    return mappedPost;
  } catch (error) {
    console.error('Error in getBlogPostById:', error);
    
    // If database access fails, try to find the post in sample data
    const samplePost = blogPosts.find(post => post.id === id);
    if (samplePost) {
      return {
        ...samplePost,
        content: `<p>${samplePost.excerpt}</p><p>Lorem ipsum dolor sit amet...</p>`,
        seo: {
          metaTitle: samplePost.title,
          metaDescription: samplePost.excerpt,
          keywords: [samplePost.category],
        },
        stats: {
          id: samplePost.id,
          views: 0, // Use 0 instead of random for fallback
          clicks: Math.floor(Math.random() * 200) + 20,
          timeSpent: Math.floor(Math.random() * 180) + 60,
        }
      };
    }
    
    return null;
  }
};

// Create a new blog post
export const createBlogPost = async (postData: BlogPostDraft): Promise<BlogPost> => {
  console.log("Creating new post with data:", postData);

  try {
    // Verify auth status before continuing
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      throw new Error("User must be authenticated to create blog posts");
    }

    // Extract keywords array from comma-separated string if needed
    const keywords = typeof postData.seo?.keywords === 'string' 
      ? (postData.seo.keywords as string).split(',').map(k => k.trim()) 
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
        date: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating blog post:', error);
      throw error;
    }

    console.log("Successfully created post:", data);
    return mapDbPostToFrontend(data);
  } catch (error) {
    console.error('Error in createBlogPost:', error);
    throw error;
  }
};

// Update an existing blog post
export const updateBlogPost = async (id: number, postData: Partial<BlogPostDraft>): Promise<BlogPost | null> => {
  console.log("Updating post", id, "with data:", postData);
  
  try {
    // Verify auth status before continuing
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      throw new Error("User must be authenticated to update blog posts");
    }
    
    // Prepare update data
    const updateData: any = {};
    
    if (postData.title) updateData.title = postData.title;
    if (postData.excerpt) updateData.excerpt = postData.excerpt;
    if (postData.content) updateData.content = postData.content;
    if (postData.category) updateData.category = postData.category;
    if (postData.image !== undefined) updateData.image = postData.image;
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
        ? (postData.seo.keywords as string).split(',').map(k => k.trim())
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
      throw error;
    }

    console.log("Successfully updated post:", data);
    return data ? mapDbPostToFrontend(data) : null;
  } catch (error) {
    console.error('Error in updateBlogPost:', error);
    throw error;
  }
};

// Delete a blog post
export const deleteBlogPost = async (id: number): Promise<boolean> => {
  try {
    // Verify auth status before continuing
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      throw new Error("User must be authenticated to delete blog posts");
    }
    
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting blog post:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteBlogPost:', error);
    return false;
  }
};
