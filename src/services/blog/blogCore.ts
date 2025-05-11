
// Import the supabase client
import { supabase } from "@/integrations/supabase/client";
import { BlogPost, BlogPostDraft } from "@/types/admin";
import { blogPosts } from "@/data/blogData"; // Import sample data

// Utility function to convert database blog post to frontend model
export const mapDbPostToFrontend = (dbPost: any): BlogPost => {
  return {
    id: dbPost.id,
    title: dbPost.title,
    excerpt: dbPost.excerpt,
    content: dbPost.content || "",
    category: dbPost.category,
    image: dbPost.image || "",
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

// Seed sample blog posts to the database if none exist
export const seedBlogPosts = async (): Promise<void> => {
  try {
    // Check if posts already exist
    const { count } = await supabase
      .from('blog_posts')
      .select('id', { count: 'exact', head: true });
      
    if (count === 0) {
      // No posts exist, seed with sample data
      for (const post of blogPosts) {
        const { error } = await supabase
          .from('blog_posts')
          .insert({
            title: post.title,
            excerpt: post.excerpt,
            content: `<p>${post.excerpt}</p><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p><p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>`,
            category: post.category,
            image: post.image,
            read_time: post.readTime,
            date: new Date(post.date).toISOString(),
            slug: post.slug,
            meta_title: post.title,
            meta_description: post.excerpt,
            keywords: [post.category]
          });
          
        if (error) {
          console.error('Error seeding blog post:', error);
        }
      }
    }
  } catch (error) {
    console.error('Error in seedBlogPosts:', error);
  }
};
