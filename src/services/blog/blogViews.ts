
import { supabase } from "@/integrations/supabase/client";

// Get view count for a specific blog post
export const getBlogPostViews = async (postId: number): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('blog_post_views')
      .select('views')
      .eq('post_id', postId)
      .single();

    if (error) {
      console.error('Error fetching blog post views:', error);
      return 0;
    }

    return data?.views || 0;
  } catch (error) {
    console.error('Error in getBlogPostViews:', error);
    return 0;
  }
};

// Increment view count for a blog post
export const incrementBlogPostViews = async (postId: number): Promise<boolean> => {
  try {
    const { error } = await supabase.rpc('increment_blog_post_views', {
      post_id: postId
    });

    if (error) {
      console.error('Error incrementing blog post views:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in incrementBlogPostViews:', error);
    return false;
  }
};

// Get total views across all blog posts
export const getTotalBlogViews = async (): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('blog_post_views')
      .select('views');

    if (error) {
      console.error('Error fetching total blog views:', error);
      return 0;
    }

    return data?.reduce((total, post) => total + (post.views || 0), 0) || 0;
  } catch (error) {
    console.error('Error in getTotalBlogViews:', error);
    return 0;
  }
};

// Get all post views for statistics
export const getAllPostViews = async (): Promise<Record<number, number>> => {
  try {
    const { data, error } = await supabase
      .from('blog_post_views')
      .select('post_id, views');

    if (error) {
      console.error('Error fetching all post views:', error);
      return {};
    }

    const viewsMap: Record<number, number> = {};
    data?.forEach(item => {
      viewsMap[item.post_id] = item.views || 0;
    });

    return viewsMap;
  } catch (error) {
    console.error('Error in getAllPostViews:', error);
    return {};
  }
};
