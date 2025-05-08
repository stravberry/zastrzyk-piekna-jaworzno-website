
import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const BackButton: React.FC = () => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate("/admin/posts");
  };

  return (
    <Button 
      variant="ghost"
      className="flex items-center text-gray-600"
      onClick={handleBackClick}
    >
      <ChevronLeft className="mr-1 h-4 w-4" />
      Back to Posts
    </Button>
  );
};
