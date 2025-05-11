
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface BlogPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const BlogPagination: React.FC<BlogPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  // Don't show pagination if there's only one page
  if (totalPages <= 1) return null;

  // Generate an array of page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    
    // Always show first page
    pages.push(1);
    
    // Add current and surrounding pages
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (pages.indexOf(i) === -1) {
        pages.push(i);
      }
    }
    
    // Always show last page if more than 1 page
    if (totalPages > 1 && pages.indexOf(totalPages) === -1) {
      pages.push(totalPages);
    }
    
    // Sort and add ellipses where needed
    const sortedPages = [...new Set(pages)].sort((a, b) => a - b);
    const result = [];
    
    for (let i = 0; i < sortedPages.length; i++) {
      // Add the page number
      result.push(sortedPages[i]);
      
      // Add ellipsis if there's a gap
      if (i < sortedPages.length - 1 && sortedPages[i + 1] - sortedPages[i] > 1) {
        result.push("ellipsis");
      }
    }
    
    return result;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex justify-center mt-10 md:mt-12">
      <div className="flex flex-wrap justify-center gap-2">
        <Button
          variant="outline"
          className="border-pink-200 text-pink-500 hover:bg-pink-50 h-9"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          size="sm"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">Poprzednia</span>
        </Button>
        
        <div className="flex flex-wrap gap-2 justify-center">
          {pageNumbers.map((page, index) => {
            if (page === "ellipsis") {
              return (
                <Button
                  key={`ellipsis-${index}`}
                  variant="outline"
                  className="border-pink-200 text-pink-500 h-9 w-9 p-0"
                  disabled
                  size="sm"
                >
                  ...
                </Button>
              );
            }
            
            const pageNum = page as number;
            return (
              <Button
                key={pageNum}
                variant="outline"
                className={
                  pageNum === currentPage
                    ? "bg-pink-500 text-white border-pink-500 h-9 w-9 p-0"
                    : "border-pink-200 text-pink-500 hover:bg-pink-50 h-9 w-9 p-0"
                }
                onClick={() => onPageChange(pageNum)}
                size="sm"
              >
                {pageNum}
              </Button>
            );
          })}
        </div>

        <Button
          variant="outline"
          className="border-pink-200 text-pink-500 hover:bg-pink-50 h-9"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          size="sm"
        >
          <span className="hidden sm:inline">Następna</span>
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};

export default BlogPagination;
