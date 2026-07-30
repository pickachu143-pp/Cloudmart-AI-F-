import React from "react";
import { Category } from "../types";

interface CategoryFilterProps {
  categories: Category[];
  selected: string;
  onSelect: (categoryId: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ categories, selected, onSelect }) => {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect("")}
        className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition ${
          selected === "" ? "bg-brand-600 text-white border-brand-600" : "bg-white text-slate-600 border-slate-200 hover:border-brand-300"
        }`}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat._id}
          onClick={() => onSelect(cat._id)}
          className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition ${
            selected === cat._id
              ? "bg-brand-600 text-white border-brand-600"
              : "bg-white text-slate-600 border-slate-200 hover:border-brand-300"
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
