
import { supabase } from "@/integrations/supabase/client";
import { BlogPost } from "@/types/admin";
import { blogPosts } from "@/data/blogData";
import { mapDbPostToFrontend, seedBlogPosts } from "./blogCore";
import { getTotalBlogViews, getAllPostViews } from "./blogViews";

// Get blog statistics
export const getBlogStats = async (): Promise<{
  totalPosts: number;
  totalViews: number;
  popularCategories: {category: string, count: number}[];
  recentPosts: BlogPost[];
}> => {
  try {
    // Try to seed sample posts first
    await seedBlogPosts();
    
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
    
    // Get recent posts with real view counts
    let recentPosts: BlogPost[] = [];
    try {
      // Sort posts by date
      const sortedPosts = [...posts].sort((a, b) => {
        try {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        } catch (error) {
          console.error('Error sorting by date:', error);
          return 0;
        }
      });
      
      // Get view counts for all posts
      const viewsMap = await getAllPostViews();
      
      recentPosts = sortedPosts.slice(0, 5).map(post => {
        const mappedPost = mapDbPostToFrontend(post);
        // Use real view count from database
        if (mappedPost.stats) {
          mappedPost.stats.views = viewsMap[post.id] || 0;
        }
        return mappedPost;
      });
    } catch (error) {
      console.error('Error processing recent posts:', error);
      recentPosts = [];
    }
    
    // Get real total views from database
    const totalViews = await getTotalBlogViews();
    
    return {
      totalPosts: posts.length,
      totalViews,
      popularCategories,
      recentPosts,
    };
  } catch (error) {
    console.error('Error in getBlogStats:', error);
    
    // Fall back to sample data
    const samplePosts = blogPosts;
    
    // Calculate categories from sample data
    const categoryCount: Record<string, number> = {};
    samplePosts.forEach(post => {
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
    
    // Get recent posts with 0 views for fallback
    const recentPosts = samplePosts
      .slice(0, 5)
      .map(post => ({
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
    
    return {
      totalPosts: samplePosts.length,
      totalViews: 0, // Use 0 instead of random for fallback
      popularCategories,
      recentPosts,
    };
  }
};
