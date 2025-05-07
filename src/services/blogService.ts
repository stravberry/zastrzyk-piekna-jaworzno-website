
import { BlogPost, BlogPostDraft, BlogPostStats } from "@/types/admin";
import { blogPosts } from "@/data/blogData";

// In a real application, this would be an API call to a backend

// Helper to generate a unique ID
const generateUniqueId = (): number => {
  const existingIds = blogPosts.map(post => post.id);
  let newId = Math.max(...existingIds) + 1;
  if (newId === -Infinity) newId = 1;
  return newId;
};

// Helper to generate a slug from title
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
};

// Get all blog posts
export const getAllBlogPosts = async (): Promise<BlogPost[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Return posts with mock stats
  return blogPosts.map(post => ({
    ...post,
    stats: {
      id: post.id,
      views: Math.floor(Math.random() * 1000) + 100,
      clicks: Math.floor(Math.random() * 200) + 20,
      timeSpent: Math.floor(Math.random() * 180) + 60,
    }
  }));
};

// Get a single blog post by ID
export const getBlogPostById = async (id: number): Promise<BlogPost | undefined> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const post = blogPosts.find(post => post.id === id);
  
  if (post) {
    return {
      ...post,
      stats: {
        id: post.id,
        views: Math.floor(Math.random() * 1000) + 100,
        clicks: Math.floor(Math.random() * 200) + 20,
        timeSpent: Math.floor(Math.random() * 180) + 60,
      },
      content: `
        <h2>This is a sample content for ${post.title}</h2>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquet nisl, eget ultricies nisl nisl eget nisl.</p>
        <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
        <h3>Key Points</h3>
        <ul>
          <li>Point one about this topic</li>
          <li>Second important consideration</li>
          <li>Final thoughts on the matter</li>
        </ul>
        <p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
      `,
      seo: {
        metaTitle: post.title,
        metaDescription: post.excerpt,
        keywords: post.category.split(',').map(k => k.trim()),
      }
    };
  }
  
  return undefined;
};

// Create a new blog post
export const createBlogPost = async (postData: BlogPostDraft): Promise<BlogPost> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const now = new Date();
  const formattedDate = `${now.getDate()} ${now.toLocaleString('default', { month: 'long' })} ${now.getFullYear()}`;
  
  const newPost: BlogPost = {
    id: generateUniqueId(),
    title: postData.title,
    excerpt: postData.excerpt,
    content: postData.content,
    category: postData.category,
    image: postData.image,
    readTime: postData.readTime || `${Math.floor(postData.content.length / 1000)} min`,
    date: formattedDate,
    slug: `/blog/${generateSlug(postData.title)}`,
    seo: postData.seo,
  };
  
  // In a real app, we would save this to a database
  blogPosts.push(newPost);
  
  return newPost;
};

// Update an existing blog post
export const updateBlogPost = async (id: number, postData: Partial<BlogPostDraft>): Promise<BlogPost | undefined> => {
  await new Promise(resolve => setTimeout(resolve, 1000));

  const postIndex = blogPosts.findIndex(post => post.id === id);
  
  if (postIndex === -1) {
    return undefined;
  }
  
  const updatedPost = {
    ...blogPosts[postIndex],
    ...postData,
    slug: postData.title 
      ? `/blog/${generateSlug(postData.title)}` 
      : blogPosts[postIndex].slug,
  };
  
  blogPosts[postIndex] = updatedPost as BlogPost;
  
  return updatedPost as BlogPost;
};

// Delete a blog post
export const deleteBlogPost = async (id: number): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const postIndex = blogPosts.findIndex(post => post.id === id);
  
  if (postIndex === -1) {
    return false;
  }
  
  blogPosts.splice(postIndex, 1);
  
  return true;
};

// Get blog statistics
export const getBlogStats = async (): Promise<{
  totalPosts: number;
  totalViews: number;
  popularCategories: {category: string, count: number}[];
  recentPosts: BlogPost[];
}> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Generate mock statistics
  const postStats: BlogPostStats[] = blogPosts.map(post => ({
    id: post.id,
    views: Math.floor(Math.random() * 1000) + 100,
    clicks: Math.floor(Math.random() * 200) + 20,
    timeSpent: Math.floor(Math.random() * 180) + 60,
  }));
  
  // Calculate total views
  const totalViews = postStats.reduce((sum, stat) => sum + stat.views, 0);
  
  // Calculate popular categories
  const categories = blogPosts.map(post => post.category);
  const categoryCount: Record<string, number> = {};
  
  categories.forEach(category => {
    if (categoryCount[category]) {
      categoryCount[category]++;
    } else {
      categoryCount[category] = 1;
    }
  });
  
  const popularCategories = Object.entries(categoryCount)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  
  // Get recent posts
  const recentPosts = [...blogPosts]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
  
  return {
    totalPosts: blogPosts.length,
    totalViews,
    popularCategories,
    recentPosts,
  };
};
