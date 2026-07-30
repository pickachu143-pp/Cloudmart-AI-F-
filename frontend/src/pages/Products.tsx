import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal } from "lucide-react";
import { Product, Category, PaginatedMeta } from "../types";
import { productService } from "../services/productService";
import { categoryService } from "../services/categoryService";
import { useDebounce } from "../hooks/useDebounce";
import ProductCard from "../components/ProductCard";
import CategoryFilter from "../components/CategoryFilter";
import Loader from "../components/Loader";

const Products: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [meta, setMeta] = useState<PaginatedMeta | null>(null);
  const [loading, setLoading] = useState(true);

  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "newest";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    categoryService.list().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    productService
      .list({ search: debouncedSearch, category, sort: sort as any, page, limit: 12 })
      .then(({ products, meta }) => {
        setProducts(products);
        setMeta(meta);
      })
      .finally(() => setLoading(false));
  }, [debouncedSearch, category, sort, page]);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    setSearchParams(next);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {search ? `Results for "${search}"` : "All Products"}
          </h1>
          {meta && <p className="text-sm text-slate-500 mt-1">{meta.total} products found</p>}
        </div>

        <div className="flex items-center gap-2">
          <SlidersHorizontal size={15} className="text-slate-400" />
          <select value={sort} onChange={(e) => updateParam("sort", e.target.value)} className="input !w-auto">
            <option value="newest">Newest</option>
            <option value="priceAsc">Price: Low to High</option>
            <option value="priceDesc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>

      <div className="mb-8">
        <CategoryFilter categories={categories} selected={category} onSelect={(id) => updateParam("category", id)} />
      </div>

      {loading ? (
        <Loader />
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-slate-500">No products match your filters.</div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => updateParam("page", String(p))}
                  className={`h-9 w-9 rounded-lg text-sm font-medium transition ${
                    p === page ? "bg-brand-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-brand-300"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Products;
