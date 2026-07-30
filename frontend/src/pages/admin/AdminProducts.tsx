import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { Product, Category } from "../../types";
import { productService } from "../../services/productService";
import { categoryService } from "../../services/categoryService";
import AdminSidebar from "../../components/AdminSidebar";
import Loader from "../../components/Loader";

interface ProductFormState {
  _id?: string;
  name: string;
  description: string;
  price: string;
  category: string;
  stock: string;
  imageUrl: string;
  tags: string;
}

const emptyForm: ProductFormState = {
  name: "",
  description: "",
  price: "",
  category: "",
  stock: "",
  imageUrl: "",
  tags: "",
};

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ProductFormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadData = () => {
    setLoading(true);
    Promise.all([productService.list({ limit: 50 }), categoryService.list()])
      .then(([{ products }, categories]) => {
        setProducts(products);
        setCategories(categories);
      })
      .finally(() => setLoading(false));
  };

  useEffect(loadData, []);

  const openCreate = () => {
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setForm({
      _id: p._id,
      name: p.name,
      description: p.description,
      price: String(p.price),
      category: typeof p.category === "string" ? p.category : p.category._id,
      stock: String(p.stock),
      imageUrl: p.imageUrl || "",
      tags: p.tags.join(", "),
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        category: form.category,
        stock: parseInt(form.stock, 10),
        imageUrl: form.imageUrl,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      };
      if (form._id) {
        await productService.update(form._id, payload);
        toast.success("Product updated.");
      } else {
        await productService.create(payload);
        toast.success("Product created.");
      }
      setShowForm(false);
      loadData();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    try {
      await productService.remove(id);
      toast.success("Product deleted.");
      loadData();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Manage Products</h1>
        <button onClick={openCreate} className="btn-primary">
          <Plus size={16} /> New Product
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <AdminSidebar />

        <div className="flex-1">
          {loading ? (
            <Loader />
          ) : (
            <div className="card overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b border-slate-100">
                    <th className="px-4 py-3 font-medium">Product</th>
                    <th className="px-4 py-3 font-medium">Category</th>
                    <th className="px-4 py-3 font-medium">Price</th>
                    <th className="px-4 py-3 font-medium">Stock</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p._id} className="border-b border-slate-50 last:border-b-0 hover:bg-slate-50/60">
                      <td className="px-4 py-3 flex items-center gap-3">
                        <img src={p.imageUrl || "https://placehold.co/60"} alt={p.name} className="h-9 w-9 rounded-lg object-cover" />
                        <span className="font-medium text-slate-700 line-clamp-1">{p.name}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{typeof p.category === "string" ? "" : p.category.name}</td>
                      <td className="px-4 py-3 font-medium">${p.price.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className={p.stock <= 5 ? "text-amber-600 font-semibold" : "text-slate-600"}>{p.stock}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-3">
                          <button onClick={() => openEdit(p)} className="text-slate-400 hover:text-brand-600" aria-label="Edit">
                            <Pencil size={15} />
                          </button>
                          <button onClick={() => handleDelete(p._id)} className="text-slate-400 hover:text-red-600" aria-label="Delete">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="card w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">{form._id ? "Edit Product" : "New Product"}</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Name</label>
                <input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea required rows={3} className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Price</label>
                  <input required type="number" step="0.01" min="0" className="input" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                </div>
                <div>
                  <label className="label">Stock</label>
                  <input required type="number" min="0" className="input" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="label">Category</label>
                <select required className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  <option value="">Select a category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Image URL</label>
                <input className="input" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." />
              </div>
              <div>
                <label className="label">Tags (comma separated)</label>
                <input className="input" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="electronics, wireless" />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? "Saving..." : "Save Product"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
