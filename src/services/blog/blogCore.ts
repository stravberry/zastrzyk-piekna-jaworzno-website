
// Import the supabase client
import { supabase } from "@/integrations/supabase/client";
import { BlogPost, BlogPostDraft } from "@/types/admin";
import { blogPosts } from "@/data/blogData"; // Import sample data

// Utility function to convert database blog post to frontend model
export const mapDbPostToFrontend = (dbPost: any): BlogPost => {
  let formattedDate;
  
  try {
    // Try to format the date, but use a fallback if it fails
    formattedDate = new Date(dbPost.date).toLocaleDateString('pl-PL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    formattedDate = dbPost.date || '1 stycznia 2025'; // Use existing string date or fallback
  }
  
  return {
    id: dbPost.id,
    title: dbPost.title,
    excerpt: dbPost.excerpt,
    content: dbPost.content || "",
    category: dbPost.category,
    image: dbPost.image || "",
    readTime: dbPost.read_time,
    date: formattedDate,
    slug: dbPost.slug || `/blog/${dbPost.id}`,
    isPublished: dbPost.is_published,
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

// Safe date parsing function
export const safeParseDate = (dateStr: string): Date => {
  try {
    // First try direct parsing - works for ISO format
    const date = new Date(dateStr);
    
    // Check if the date is valid
    if (!isNaN(date.getTime())) {
      return date;
    }
    
    // If the direct parsing failed, try to parse Polish date format
    // Polish format example: "10 kwietnia 2025"
    const parts = dateStr.split(' ');
    if (parts.length === 3) {
      // Simple mapping of Polish month names to numbers
      const monthMap: {[key: string]: number} = {
        'stycznia': 0, 'lutego': 1, 'marca': 2, 'kwietnia': 3, 
        'maja': 4, 'czerwca': 5, 'lipca': 6, 'sierpnia': 7, 
        'września': 8, 'października': 9, 'listopada': 10, 'grudnia': 11
      };
      
      const day = parseInt(parts[0], 10);
      const month = monthMap[parts[1].toLowerCase()];
      const year = parseInt(parts[2], 10);
      
      if (!isNaN(day) && month !== undefined && !isNaN(year)) {
        return new Date(year, month, day);
      }
    }
    
    // If parsing failed, return current date
    console.warn(`Failed to parse date: ${dateStr}, using current date instead`);
    return new Date();
  } catch (e) {
    console.error('Error parsing date:', e);
    return new Date(); // Return current date as fallback
  }
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
        // Parse the date safely
        const parsedDate = safeParseDate(post.date);
        
        const { error } = await supabase
          .from('blog_posts')
          .insert({
            title: post.title,
            excerpt: post.excerpt,
            content: `<p>${post.excerpt}</p><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p><p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>`,
            category: post.category,
            image: post.image,
            read_time: post.readTime,
            date: parsedDate.toISOString(),
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
