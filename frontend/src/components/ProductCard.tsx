import React from "react";
import { Link } from "react-router-dom";
import { Star, ShoppingCart } from "lucide-react";
import { Product } from "../types";
import { useCart } from "../hooks/useCart";

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { addItem } = useCart();
  const categoryName = typeof product.category === "string" ? "" : product.category?.name;

  return (
    <div className="card group overflow-hidden flex flex-col hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
      <Link to={`/products/${product._id}`} className="block aspect-[4/3] bg-slate-100 overflow-hidden">
        <img
          src={product.imageUrl || "https://placehold.co/400x300?text=CloudMart+AI"}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </Link>

      <div className="p-4 flex flex-col gap-2 flex-1">
        {categoryName && (
          <span className="text-[11px] font-semibold uppercase tracking-wide text-brand-600">{categoryName}</span>
        )}
        <Link to={`/products/${product._id}`} className="font-semibold text-slate-800 line-clamp-2 hover:text-brand-700 transition">
          {product.name}
        </Link>

        <div className="flex items-center gap-1 text-amber-500 text-xs">
          <Star size={13} fill="currentColor" />
          <span className="text-slate-600">
            {product.ratingAverage.toFixed(1)} ({product.ratingCount})
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-lg font-bold text-slate-900">
            {new Intl.NumberFormat("en-IN", {
              style: "currency",
              currency: "INR",
              maximumFractionDigits: 2,
            }).format(product.price)}
          </span>
          <button
            onClick={() => addItem(product._id, 1)}
            disabled={product.stock === 0}
            className="btn-primary !px-3 !py-2"
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCart size={15} />
          </button>
        </div>
        {product.stock === 0 && <span className="text-xs font-medium text-red-500">Out of stock</span>}
        {product.stock > 0 && product.stock <= 5 && (
          <span className="text-xs font-medium text-amber-600">Only {product.stock} left</span>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
