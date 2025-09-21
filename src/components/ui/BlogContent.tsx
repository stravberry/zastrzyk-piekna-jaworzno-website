import React from "react";
import { cn } from "@/lib/utils";

interface BlogContentProps {
  content: string;
  className?: string;
}

export const BlogContent: React.FC<BlogContentProps> = ({ 
  content, 
  className 
}) => {
  return (
    <>
      <div 
        className={cn("blog-content", className)}
        dangerouslySetInnerHTML={{ __html: content }}
      />
      <style>{`
        .blog-content h1 {
          font-size: 2rem;
          font-weight: 700;
          line-height: 1.2;
          margin: 1.5rem 0 1rem 0;
          color: hsl(var(--foreground));
        }
        
        @media (max-width: 640px) {
          .blog-content h1 {
            font-size: 1.75rem;
          }
        }
        
        .blog-content h2 {
          font-size: 1.5rem;
          font-weight: 600;
          line-height: 1.3;
          margin: 1.25rem 0 0.75rem 0;
          color: hsl(var(--foreground));
        }
        
        @media (max-width: 640px) {
          .blog-content h2 {
            font-size: 1.375rem;
          }
        }
        
        .blog-content h3 {
          font-size: 1.25rem;
          font-weight: 600;
          line-height: 1.4;
          margin: 1rem 0 0.5rem 0;
          color: hsl(var(--foreground));
        }
        
        @media (max-width: 640px) {
          .blog-content h3 {
            font-size: 1.125rem;
          }
        }
        
        .blog-content h4 {
          font-size: 1.1rem;
          font-weight: 600;
          line-height: 1.4;
          margin: 1rem 0 0.5rem 0;
          color: hsl(var(--foreground));
        }
        
        @media (max-width: 640px) {
          .blog-content h4 {
            font-size: 1rem;
          }
        }
        
        .blog-content p {
          margin: 0.75rem 0;
          line-height: 1.6;
          color: hsl(var(--foreground));
        }
        
        .blog-content ul,
        .blog-content ol {
          padding-left: 1.5rem;
          margin: 0.75rem 0;
          color: hsl(var(--foreground));
        }
        
        .blog-content li {
          margin: 0.25rem 0;
        }
        
        .blog-content blockquote {
          border-left: 4px solid hsl(var(--border));
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          background: hsl(var(--muted) / 0.3);
          padding: 1rem;
          border-radius: 0.375rem;
          color: hsl(var(--foreground));
        }
        
        .blog-content code {
          background: hsl(var(--muted));
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-size: 0.85em;
          color: hsl(var(--foreground));
        }
        
        .blog-content pre {
          background: hsl(var(--muted));
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1rem 0;
        }
        
        .blog-content pre code {
          background: none;
          padding: 0;
        }
        
        .blog-content hr {
          margin: 2rem 0;
          border: none;
          border-top: 2px solid hsl(var(--border));
        }
        
        .blog-content table {
          margin: 1rem 0;
          width: 100%;
          border-collapse: collapse;
        }
        
        .blog-content table th,
        .blog-content table td {
          border: 1px solid hsl(var(--border));
          padding: 0.5rem;
          text-align: left;
        }
        
        .blog-content table th {
          background: hsl(var(--muted));
          font-weight: 600;
        }
        
        .blog-content img {
          margin: 1rem auto;
          display: block;
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
        }
        
        .blog-content a {
          color: hsl(var(--primary));
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        
        .blog-content a:hover {
          opacity: 0.8;
        }
        
        .blog-content strong {
          font-weight: 700;
          color: hsl(var(--foreground));
        }
        
        .blog-content em {
          font-style: italic;
        }
        
        /* Responsive adjustments */
        @media (max-width: 640px) {
          .blog-content {
            font-size: 0.9rem;
          }
          
          .blog-content ul,
          .blog-content ol {
            padding-left: 1.25rem;
          }
          
          .blog-content blockquote {
            padding: 0.75rem;
            margin: 0.75rem 0;
          }
          
          .blog-content pre {
            padding: 0.75rem;
            font-size: 0.8rem;
          }
          
          .blog-content table {
            font-size: 0.85rem;
          }
          
          .blog-content table th,
          .blog-content table td {
            padding: 0.375rem;
          }
        }
      `}</style>
    </>
  );
};