import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, ShieldCheck, Truck, Cpu } from "lucide-react";
import { Product } from "../types";
import { productService } from "../services/productService";
import { recommendationService } from "../services/recommendationService";
import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";

const Home: React.FC = () => {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [recommended, setRecommended] = useState<Product[]>([]);
  const [personalized, setPersonalized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      
      try {
  const { products } = await productService.list({
    limit: 8,
    sort: "rating",
  });

  setFeatured(products);

  try {
    const recs = await recommendationService.getForMe();
    setRecommended(recs.products);
    setPersonalized(recs.personalized);
  } catch (err) {
    console.log("Recommendation API failed", err);
    setRecommended(products);
    setPersonalized(false);
  }
} finally {
  setLoading(false);
}
    })();
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-700 via-brand-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide bg-white/10 border border-white/20 rounded-full px-3 py-1.5 mb-5">
              <Sparkles size={13} /> AI-Powered Shopping
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-5">
              Shop smarter with <span className="text-brand-200">CloudMart AI</span>
            </h1>
            <p className="text-brand-100 text-lg mb-8 max-w-md">
              Personalized recommendations powered by IBM Watson, backed by an enterprise-grade
              cloud platform built on IBM Cloudant, Docker, and Kubernetes.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/products" className="btn bg-white text-brand-700 hover:bg-brand-50 font-bold">
                Shop All Products
              </Link>
              <Link to="/recommendations" className="btn bg-white/10 border border-white/30 text-white hover:bg-white/20">
                See Recommendations
              </Link>
            </div>
          </div>
          <div className="hidden md:grid grid-cols-2 gap-4">
            {[
              { icon: Cpu, title: "Watson AI", desc: "Smart, personalized recommendations" },
              { icon: ShieldCheck, title: "Secure Checkout", desc: "JWT-authenticated & encrypted" },
              { icon: Truck, title: "Order Tracking", desc: "Real-time status updates" },
              { icon: Sparkles, title: "Cloud Native", desc: "Docker & Kubernetes ready" },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white/10 border border-white/15 rounded-xl p-4 backdrop-blur">
                <Icon size={20} className="mb-2 text-brand-200" />
                <p className="font-semibold text-sm">{title}</p>
                <p className="text-xs text-brand-100 mt-0.5">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-16">
        {/* Recommendations */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Sparkles size={20} className="text-brand-600" />
                {personalized ? "Recommended For You" : "Trending Picks"}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                {personalized
                  ? "Curated by IBM Watson based on your recent activity."
                  : "Popular products, powered by our AI recommendation engine."}
              </p>
            </div>
            <Link to="/recommendations" className="text-sm font-semibold text-brand-600 hover:underline shrink-0">
              View all
            </Link>
          </div>
          {loading ? (
            <Loader />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {recommended.slice(0, 4).map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
        </section>

        {/* Featured */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Top Rated Products</h2>
            <Link to="/products" className="text-sm font-semibold text-brand-600 hover:underline">
              Browse catalog
            </Link>
          </div>
          {loading ? (
            <Loader />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {featured.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Home;
