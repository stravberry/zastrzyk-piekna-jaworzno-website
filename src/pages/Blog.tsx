
import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BlogHero from "@/components/blog/BlogHero";
import CategoryFilter from "@/components/blog/CategoryFilter";
import BlogCard from "@/components/blog/BlogCard";
import BlogPagination from "@/components/blog/BlogPagination";
import BlogNewsletter from "@/components/blog/BlogNewsletter";
import { getAllBlogPosts } from "@/services/blog/blogPosts";
import { BlogPost } from "@/types/admin";

const Blog = () => {
  const [activeCategory, setActiveCategory] = useState("Wszystkie");
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const fetchedPosts = await getAllBlogPosts();
        setPosts(fetchedPosts);
      } catch (error) {
        console.error("Failed to fetch blog posts", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Reset to first page when category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory]);

  // Categories for filtering (derived from blog posts)
  const categories = [
    "Wszystkie",
    ...Array.from(new Set(posts.map((post) => post.category))),
  ];

  // Filter posts by category
  const filteredPosts = activeCategory === "Wszystkie"
    ? posts
    : posts.filter(post => post.category === activeCategory);

  // Calculate pagination
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const currentPosts = filteredPosts.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of posts section
    window.scrollTo({ top: document.getElementById('blog-posts')?.offsetTop || 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24">
        {/* Hero Section */}
        <BlogHero />

        {/* Blog Articles */}
        <section id="blog-posts" className="py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <CategoryFilter 
              categories={categories} 
              activeCategory={activeCategory} 
              onCategoryChange={setActiveCategory} 
            />

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="bg-gray-100 h-80 rounded-lg animate-pulse"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {currentPosts.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
                {currentPosts.length === 0 && (
                  <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-8">
                    <h3 className="text-xl text-gray-500">Brak artykułów w wybranej kategorii</h3>
                  </div>
                )}
              </div>
            )}

            <BlogPagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </section>

        {/* Newsletter Section */}
        <BlogNewsletter />
      </main>
      <Footer />
    </div>
  );
};

export default Blog;
