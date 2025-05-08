
import React from "react";
import { Link } from "react-router-dom";
import { Eye, Calendar, ArrowRight } from "lucide-react";
import { BlogPost } from "@/types/admin";

// Create a simplified type that only includes the props needed for display
type BlogCardProps = {
  post: Pick<BlogPost, 'id' | 'title' | 'excerpt' | 'date' | 'category' | 'image' | 'readTime' | 'slug'>;
}

const BlogCard: React.FC<BlogCardProps> = ({ post }) => {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-pink-100 flex flex-col">
      <Link to={post.slug} className="block h-48 overflow-hidden">
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </Link>
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs text-white bg-pink-500 px-2 py-1 rounded-full">
            {post.category}
          </span>
          <div className="flex items-center text-gray-500 text-sm">
            <Calendar size={14} className="mr-1" />
            {post.date}
          </div>
        </div>
        <Link to={post.slug} className="block mb-3">
          <h3 className="text-xl font-bold text-gray-800 hover:text-pink-500 transition-colors font-playfair">
            {post.title}
          </h3>
        </Link>
        <p className="text-gray-600 mb-4 flex-grow">{post.excerpt}</p>
        <div className="flex justify-between items-center">
          <div className="flex items-center text-gray-500 text-sm">
            <Eye size={14} className="mr-1" />
            {post.readTime} czytania
          </div>
          <Link
            to={post.slug}
            className="text-pink-500 hover:text-pink-600 font-medium flex items-center transition-colors"
          >
            Czytaj więcej
            <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BlogCard;
