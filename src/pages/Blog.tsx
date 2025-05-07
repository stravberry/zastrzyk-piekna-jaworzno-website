
import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BlogHero from "@/components/blog/BlogHero";
import CategoryFilter from "@/components/blog/CategoryFilter";
import BlogCard from "@/components/blog/BlogCard";
import BlogPagination from "@/components/blog/BlogPagination";
import BlogNewsletter from "@/components/blog/BlogNewsletter";
import { blogPosts } from "@/data/blogData";

const Blog = () => {
  // State for category filter
  const [activeCategory, setActiveCategory] = useState("Wszystkie");

  // Categories for filtering (derived from blog posts)
  const categories = [
    "Wszystkie",
    ...new Set(blogPosts.map((post) => post.category)),
  ];

  // Filter posts by category
  const filteredPosts = activeCategory === "Wszystkie"
    ? blogPosts
    : blogPosts.filter(post => post.category === activeCategory);

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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>

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
