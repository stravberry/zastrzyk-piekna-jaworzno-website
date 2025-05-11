
import React from "react";

interface CategoryFilterProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  activeCategory,
  onCategoryChange,
}) => {
  return (
    <div className="mb-8 md:mb-12 overflow-x-auto pb-2">
      <div className="flex space-x-3 min-w-max">
        {categories.map((category, index) => (
          <button
            key={index}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              category === activeCategory
                ? "bg-pink-500 text-white"
                : "bg-pink-50 text-gray-700 hover:bg-pink-100"
            }`}
            onClick={() => onCategoryChange(category)}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
