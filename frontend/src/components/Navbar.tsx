import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Search, Menu, X, User, LayoutDashboard, LogOut, Sparkles } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";

const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(search.trim() ? `/products?search=${encodeURIComponent(search.trim())}` : "/products");
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <Link to="/" className="flex items-center gap-2 font-extrabold text-xl text-slate-900 shrink-0">
            <span className="h-8 w-8 rounded-lg bg-brand-600 text-white flex items-center justify-center">
              <Sparkles size={18} />
            </span>
            CloudMart<span className="text-brand-600">AI</span>
          </Link>

          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md relative">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="input pl-9"
            />
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </form>

          <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-slate-600 shrink-0">
            <Link to="/products" className="hover:text-brand-600 transition">
              Shop
            </Link>
            <Link to="/recommendations" className="hover:text-brand-600 transition flex items-center gap-1">
              <Sparkles size={14} /> For You
            </Link>
            {isAuthenticated && (
              <Link to="/orders" className="hover:text-brand-600 transition">
                Orders
              </Link>
            )}
            {isAdmin && (
              <Link to="/admin" className="hover:text-brand-600 transition flex items-center gap-1">
                <LayoutDashboard size={14} /> Admin
              </Link>
            )}

            <Link to="/cart" className="relative hover:text-brand-600 transition">
              <ShoppingCart size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 h-4 min-w-4 px-1 rounded-full bg-brand-600 text-white text-[10px] flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-slate-700">
                  <User size={16} /> {user?.name.split(" ")[0]}
                </span>
                <button onClick={logout} className="text-slate-400 hover:text-red-600 transition" title="Log out">
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn-primary !py-2">
                Sign In
              </Link>
            )}
          </nav>

          <button className="md:hidden text-slate-700" onClick={() => setMenuOpen((v) => !v)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-slate-200 px-4 py-4 space-y-4 bg-white">
          <form onSubmit={handleSearch} className="relative">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="input pl-9"
            />
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </form>
          <div className="flex flex-col gap-3 text-sm font-medium text-slate-700">
            <Link to="/products" onClick={() => setMenuOpen(false)}>Shop</Link>
            <Link to="/recommendations" onClick={() => setMenuOpen(false)}>For You</Link>
            <Link to="/cart" onClick={() => setMenuOpen(false)}>Cart ({itemCount})</Link>
            {isAuthenticated && <Link to="/orders" onClick={() => setMenuOpen(false)}>Orders</Link>}
            {isAdmin && <Link to="/admin" onClick={() => setMenuOpen(false)}>Admin Dashboard</Link>}
            {isAuthenticated ? (
              <button onClick={logout} className="text-left text-red-600">Log out</button>
            ) : (
              <Link to="/login" onClick={() => setMenuOpen(false)} className="text-brand-600">Sign In</Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
