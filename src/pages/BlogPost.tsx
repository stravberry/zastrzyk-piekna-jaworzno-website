import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Calendar, Eye, Clock, ArrowLeft, Share2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { BlogContent } from "@/components/ui/BlogContent";
import { BlogPost as BlogPostType } from "@/types/admin";
import { getAllBlogPosts } from "@/services/blog/blogPosts";
import { useToast } from "@/hooks/use-toast";

const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState<BlogPostType[]>([]);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        if (!slug) {
          navigate('/blog');
          return;
        }

        // Get all posts and find the one with matching slug
        const allPosts = await getAllBlogPosts();
        const foundPost = allPosts.find(p => p.slug === `/blog/${slug}`);
        
        if (!foundPost) {
          navigate('/blog');
          return;
        }

        setPost(foundPost);
        
        // Get related posts from the same category (excluding current post)
        const related = allPosts
          .filter(p => p.category === foundPost.category && p.id !== foundPost.id)
          .slice(0, 3);
        setRelatedPosts(related);
      } catch (error) {
        console.error("Failed to fetch blog post:", error);
        toast({
          title: "Błąd",
          description: "Nie udało się załadować artykułu",
          variant: "destructive",
        });
        navigate('/blog');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug, navigate, toast]);

  const handleShare = async () => {
    if (navigator.share && post) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href,
        });
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link skopiowany",
          description: "Link do artykułu został skopiowany do schowka",
        });
      }
    } else if (post) {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link skopiowany",
        description: "Link do artykułu został skopiowany do schowka",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Ładowanie artykułu...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Artykuł nie został znaleziony</h1>
            <Button onClick={() => navigate('/blog')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Powrót do bloga
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>{post.seo?.metaTitle || post.title} | Zastrzyk Piękna</title>
        <meta name="description" content={post.seo?.metaDescription || post.excerpt} />
        <meta name="keywords" content={post.seo?.keywords?.join(', ') || post.category} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:image" content={post.image} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href={window.location.href} />
      </Helmet>

      <Navbar />
      
      <main className="flex-grow pt-24">
        {/* Hero Section */}
        <section className="relative h-[60vh] bg-gray-900 overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${post.image})` }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          </div>
          
          <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
            <div className="max-w-4xl">
              <div className="mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/blog')}
                  className="text-white hover:text-pink-300 hover:bg-white/10"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Powrót do bloga
                </Button>
              </div>
              
              <span className="inline-block bg-pink-500 text-white px-3 py-1 rounded-full text-sm font-medium mb-4">
                {post.category}
              </span>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 font-playfair leading-tight">
                {post.title}
              </h1>
              
              <p className="text-lg text-gray-200 mb-6 max-w-2xl">
                {post.excerpt}
              </p>
              
              <div className="flex flex-wrap items-center gap-6 text-gray-300">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{post.date}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>{post.readTime} czytania</span>
                </div>
                <div className="flex items-center">
                  <Eye className="h-4 w-4 mr-2" />
                  <span>{post.stats?.views || 0} wyświetleń</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                  className="text-gray-300 hover:text-white hover:bg-white/10"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Udostępnij
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Article Content */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <article>
              <BlogContent 
                content={post.content}
                className="text-gray-700 leading-relaxed"
              />
            </article>
          </div>
        </section>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-12 font-playfair">
                Powiązane artykuły
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {relatedPosts.map((relatedPost) => (
                  <div key={relatedPost.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                    <div 
                      className="h-48 bg-cover bg-center cursor-pointer"
                      style={{ backgroundImage: `url(${relatedPost.image})` }}
                      onClick={() => navigate(relatedPost.slug)}
                    />
                    <div className="p-4">
                      <span className="text-xs text-pink-500 font-medium">
                        {relatedPost.category}
                      </span>
                      <h3 
                        className="text-lg font-bold text-gray-800 hover:text-pink-500 transition-colors cursor-pointer mt-2 mb-2 line-clamp-2"
                        onClick={() => navigate(relatedPost.slug)}
                      >
                        {relatedPost.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                        {relatedPost.excerpt}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(relatedPost.slug)}
                        className="w-full"
                      >
                        Czytaj więcej
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default BlogPost;