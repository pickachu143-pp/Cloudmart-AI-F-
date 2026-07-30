import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, ShoppingCart, Minus, Plus, ShieldCheck, Truck } from "lucide-react";
import { Product } from "../types";
import { productService } from "../services/productService";
import { useCart } from "../hooks/useCart";
import Loader from "../components/Loader";
import ProductCard from "../components/ProductCard";

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [similar, setSimilar] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setQuantity(1);
    Promise.all([productService.getById(id), productService.getSimilar(id)])
      .then(([p, s]) => {
        setProduct(p);
        setSimilar(s);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader fullScreen />;
  if (!product) {
    return <div className="text-center py-24 text-slate-500">Product not found.</div>;
  }

  const categoryName = typeof product.category === "string" ? "" : product.category?.name;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid md:grid-cols-2 gap-10">
        <div className="rounded-2xl overflow-hidden bg-slate-100 aspect-square">
          <img
            src={product.imageUrl || "https://placehold.co/600x600?text=CloudMart+AI"}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div>
          {categoryName && (
            <Link to={`/products?category=${typeof product.category !== "string" ? product.category._id : ""}`} className="text-xs font-semibold uppercase tracking-wide text-brand-600">
              {categoryName}
            </Link>
          )}
          <h1 className="text-3xl font-bold text-slate-900 mt-2">{product.name}</h1>

          <div className="flex items-center gap-1.5 text-amber-500 text-sm mt-2">
            <Star size={16} fill="currentColor" />
            <span className="text-slate-600">
              {product.ratingAverage.toFixed(1)} &middot; {product.ratingCount} reviews
            </span>
          </div>

          <p className="text-3xl font-extrabold text-slate-900 mt-5">
            ₹{product.price.toLocaleString("en-IN")}
          </p>

          <p className="text-slate-600 mt-4 leading-relaxed">{product.description}</p>

          <div className="flex flex-wrap gap-2 mt-4">
            {product.tags.map((tag) => (
              <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
                #{tag}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-4 mt-8">
            <div className="flex items-center border border-slate-200 rounded-lg">
              <button className="p-2.5 hover:bg-slate-50 disabled:opacity-40" disabled={quantity <= 1} onClick={() => setQuantity((q) => q - 1)}>
                <Minus size={15} />
              </button>
              <span className="px-4 text-sm font-semibold">{quantity}</span>
              <button
                className="p-2.5 hover:bg-slate-50 disabled:opacity-40"
                disabled={quantity >= product.stock}
                onClick={() => setQuantity((q) => q + 1)}
              >
                <Plus size={15} />
              </button>
            </div>

            <button
              onClick={() => addItem(product._id, quantity)}
              disabled={product.stock === 0}
              className="btn-primary flex-1"
            >
              <ShoppingCart size={16} />
              {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </button>
          </div>

          {product.stock > 0 && product.stock <= 5 && (
            <p className="text-sm font-medium text-amber-600 mt-3">Only {product.stock} left in stock — order soon.</p>
          )}

          <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-slate-100 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-brand-600" /> Secure checkout
            </div>
            <div className="flex items-center gap-2">
              <Truck size={16} className="text-brand-600" /> Order tracking included
            </div>
          </div>
        </div>
      </div>

      {similar.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl font-bold text-slate-900 mb-6">You might also like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {similar.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetail;
