
import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BlogHero from "@/components/blog/BlogHero";
import CategoryFilter from "@/components/blog/CategoryFilter";
import BlogCard from "@/components/blog/BlogCard";
import BlogPagination from "@/components/blog/BlogPagination";
import BlogNewsletter from "@/components/blog/BlogNewsletter";
import { getAllBlogPosts } from "@/services/blogService";
import { BlogPost } from "@/types/admin";

const Blog = () => {
  const [activeCategory, setActiveCategory] = useState("Wszystkie");
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Categories for filtering (derived from blog posts)
  const categories = [
    "Wszystkie",
    ...Array.from(new Set(posts.map((post) => post.category))),
  ];

  // Filter posts by category
  const filteredPosts = activeCategory === "Wszystkie"
    ? posts
    : posts.filter(post => post.category === activeCategory);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24">
        {/* Hero Section */}
        <BlogHero />

        {/* Blog Articles */}
        <section className="py-16 bg-white">
          <div className="container-custom">
            <CategoryFilter 
              categories={categories} 
              activeCategory={activeCategory} 
              onCategoryChange={setActiveCategory} 
            />

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="bg-gray-100 h-80 rounded-lg animate-pulse"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPosts.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>
            )}

            <BlogPagination />
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
