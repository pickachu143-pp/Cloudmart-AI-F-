import React from "react";
import { Link } from "react-router-dom";
import { Cloud, Github, Twitter, Linkedin } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-2 text-white font-extrabold text-lg mb-3">
            <Cloud size={20} className="text-brand-400" /> CloudMart AI
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            An enterprise e-commerce platform powered by IBM Cloudant and IBM Watson AI —
            built on React, Node.js, Docker, and Kubernetes.
          </p>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3 text-sm">Shop</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><Link to="/products" className="hover:text-white transition">All Products</Link></li>
            <li><Link to="/recommendations" className="hover:text-white transition">Recommended For You</Link></li>
            <li><Link to="/cart" className="hover:text-white transition">Cart</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3 text-sm">Account</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><Link to="/orders" className="hover:text-white transition">Order History</Link></li>
            <li><Link to="/login" className="hover:text-white transition">Sign In</Link></li>
            <li><Link to="/signup" className="hover:text-white transition">Create Account</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3 text-sm">Platform</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li>IBM Cloud &middot; IBM Cloudant</li>
            <li>IBM Watson AI Recommendations</li>
            <li>Docker &middot; Kubernetes</li>
          </ul>
          <div className="flex gap-3 mt-4">
            <Github size={18} className="hover:text-white transition cursor-pointer" />
            <Twitter size={18} className="hover:text-white transition cursor-pointer" />
            <Linkedin size={18} className="hover:text-white transition cursor-pointer" />
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800 py-5 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} CloudMart AI. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
