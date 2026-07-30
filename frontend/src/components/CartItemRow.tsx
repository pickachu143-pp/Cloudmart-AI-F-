import React from "react";
import { Link } from "react-router-dom";
import { Trash2, Minus, Plus } from "lucide-react";
import { CartItem } from "../types";
import { useCart } from "../hooks/useCart";

const CartItemRow: React.FC<{ item: CartItem }> = ({ item }) => {
  const { updateQuantity, removeItem } = useCart();
  const { product } = item;

  return (
    <div className="flex items-center gap-4 py-4 border-b border-slate-100 last:border-b-0">
      <Link to={`/products/${product._id}`} className="h-20 w-20 rounded-lg overflow-hidden bg-slate-100 shrink-0">
        <img
          src={product.imageUrl || "https://placehold.co/200x200?text=CloudMart+AI"}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </Link>

      <div className="flex-1 min-w-0">
        <Link to={`/products/${product._id}`} className="font-medium text-slate-800 hover:text-brand-700 line-clamp-1">
          {product.name}
        </Link>
        <p className="text-sm text-slate-500 mt-0.5">${item.priceAtAdd.toFixed(2)} each</p>

        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center border border-slate-200 rounded-lg">
            <button
              className="p-1.5 hover:bg-slate-50 disabled:opacity-40"
              disabled={item.quantity <= 1}
              onClick={() => updateQuantity(product._id, item.quantity - 1)}
            >
              <Minus size={14} />
            </button>
            <span className="px-3 text-sm font-medium">{item.quantity}</span>
            <button
              className="p-1.5 hover:bg-slate-50 disabled:opacity-40"
              disabled={item.quantity >= product.stock}
              onClick={() => updateQuantity(product._id, item.quantity + 1)}
            >
              <Plus size={14} />
            </button>
          </div>
          <button
            onClick={() => removeItem(product._id)}
            className="text-slate-400 hover:text-red-600 transition"
            aria-label={`Remove ${product.name}`}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="text-right font-semibold text-slate-800 shrink-0">
        ${(item.priceAtAdd * item.quantity).toFixed(2)}
      </div>
    </div>
  );
};

export default CartItemRow;
