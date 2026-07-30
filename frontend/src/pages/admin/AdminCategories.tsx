import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { Category } from "../../types";
import { categoryService } from "../../services/categoryService";
import AdminSidebar from "../../components/AdminSidebar";
import Loader from "../../components/Loader";

const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<{ _id?: string; name: string; description: string }>({ name: "", description: "" });
  const [saving, setSaving] = useState(false);

  const loadData = () => {
    setLoading(true);
    categoryService.list().then(setCategories).finally(() => setLoading(false));
  };

  useEffect(loadData, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (form._id) {
        await categoryService.update(form._id, { name: form.name, description: form.description });
        toast.success("Category updated.");
      } else {
        await categoryService.create({ name: form.name, description: form.description });
        toast.success("Category created.");
      }
      setShowForm(false);
      setForm({ name: "", description: "" });
      loadData();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    try {
      await categoryService.remove(id);
      toast.success("Category deleted.");
      loadData();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Manage Categories</h1>
        <button
          onClick={() => {
            setForm({ name: "", description: "" });
            setShowForm(true);
          }}
          className="btn-primary"
        >
          <Plus size={16} /> New Category
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <AdminSidebar />

        <div className="flex-1">
          {loading ? (
            <Loader />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((c) => (
                <div key={c._id} className="card p-4">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-slate-800">{c.name}</h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setForm({ _id: c._id, name: c.name, description: c.description || "" });
                          setShowForm(true);
                        }}
                        className="text-slate-400 hover:text-brand-600"
                      >
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(c._id)} className="text-slate-400 hover:text-red-600">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">{c.description || "No description"}</p>
                  <p className="text-[11px] text-slate-400 mt-2">/{c.slug}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="card w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">{form._id ? "Edit Category" : "New Category"}</h2>
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
                <textarea rows={3} className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? "Saving..." : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
