
import React from "react";
import { Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";

const InstagramSection = () => {
  // Sample Instagram posts
  const instaPosts = [
    { id: 1, imageUrl: "/images/insta-1.jpg", likes: 124, comments: 15 },
    { id: 2, imageUrl: "/images/insta-2.jpg", likes: 98, comments: 8 },
    { id: 3, imageUrl: "/images/insta-3.jpg", likes: 156, comments: 22 },
    { id: 4, imageUrl: "/images/insta-4.jpg", likes: 87, comments: 11 },
  ];

  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-playfair">
            <span>Śledź mnie na </span>
            <span className="text-pink-500">Instagramie</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Zapraszam na mój Instagram @zastrzyk_piekna, gdzie znajdziesz wiele edukacyjnych materiałów, 
            zdjęcia efektów zabiegów oraz aktualności z życia gabinetu.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {instaPosts.map((post) => (
            <div 
              key={post.id} 
              className="relative rounded-lg overflow-hidden group aspect-square"
            >
              <img 
                src={post.imageUrl} 
                alt={`Instagram post ${post.id}`} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                <div className="flex items-center justify-center space-x-4">
                  <span className="text-white flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                    {post.likes}
                  </span>
                  <span className="text-white flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                    </svg>
                    {post.comments}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Button asChild variant="outline" className="border-pink-500 text-pink-500 hover:bg-pink-50">
            <a 
              href="https://instagram.com/zastrzyk_piekna" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center"
            >
              <Instagram className="mr-2 h-4 w-4" />
              <span>Obserwuj @zastrzyk_piekna</span>
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default InstagramSection;
