
import React from "react";
import { Button } from "@/components/ui/button";

const BlogPagination: React.FC = () => {
  return (
    <div className="flex justify-center mt-12">
      <div className="flex space-x-2">
        <Button
          variant="outline"
          className="border-pink-200 text-pink-500 hover:bg-pink-50"
          disabled
        >
          Poprzednia
        </Button>
        <Button variant="outline" className="bg-pink-500 text-white border-pink-500">
          1
        </Button>
        <Button
          variant="outline"
          className="border-pink-200 text-pink-500 hover:bg-pink-50"
        >
          2
        </Button>
        <Button
          variant="outline"
          className="border-pink-200 text-pink-500 hover:bg-pink-50"
        >
          3
        </Button>
        <Button
          variant="outline"
          className="border-pink-200 text-pink-500 hover:bg-pink-50"
        >
          Następna
        </Button>
      </div>
    </div>
  );
};

export default BlogPagination;
