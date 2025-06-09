
import React from "react";
import { Link } from "react-router-dom";
import { Eye, Calendar, ArrowRight } from "lucide-react";
import { BlogPost } from "@/types/admin";

// Create a simplified type that only includes the props needed for display
type BlogCardProps = {
  post: Pick<BlogPost, 'id' | 'title' | 'excerpt' | 'date' | 'category' | 'image' | 'readTime' | 'slug' | 'stats'>;
}

const BlogCard: React.FC<BlogCardProps> = ({ post }) => {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-pink-100 flex flex-col h-full">
      <Link to={post.slug} className="block h-48 overflow-hidden">
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          loading="lazy"
        />
      </Link>
      <div className="p-4 md:p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs text-white bg-pink-500 px-2 py-1 rounded-full truncate max-w-[120px]">
            {post.category}
          </span>
          <div className="flex items-center text-gray-500 text-xs">
            <Calendar size={12} className="mr-1" />
            {post.date}
          </div>
        </div>
        <Link to={post.slug} className="block mb-3">
          <h3 className="text-lg md:text-xl font-bold text-gray-800 hover:text-pink-500 transition-colors font-playfair line-clamp-2">
            {post.title}
          </h3>
        </Link>
        <p className="text-sm md:text-base text-gray-600 mb-4 flex-grow line-clamp-3">{post.excerpt}</p>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3 text-gray-500 text-xs">
            <div className="flex items-center">
              <Eye size={12} className="mr-1" />
              <span>{post.stats?.views || 0} wyświetleń</span>
            </div>
            <span>{post.readTime} czytania</span>
          </div>
          <Link
            to={post.slug}
            className="text-pink-500 hover:text-pink-600 font-medium flex items-center transition-colors text-sm"
          >
            Czytaj więcej
            <ArrowRight size={14} className="ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BlogCard;
