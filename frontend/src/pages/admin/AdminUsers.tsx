import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { User, PaginatedMeta } from "../../types";
import { adminService } from "../../services/adminService";
import AdminSidebar from "../../components/AdminSidebar";
import Loader from "../../components/Loader";

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [meta, setMeta] = useState<PaginatedMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    adminService
      .getUsers(page, 20)
      .then(({ users, meta }) => {
        setUsers(users);
        setMeta(meta);
      })
      .finally(() => setLoading(false));
  };

  useEffect(loadData, [page]);

  const toggleActive = async (user: User) => {
    try {
      await adminService.setUserActive(user.id, !user.isActive);
      toast.success(`User ${user.isActive ? "deactivated" : "activated"}.`);
      loadData();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Manage Users</h1>

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
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-slate-50 last:border-b-0 hover:bg-slate-50/60">
                      <td className="px-4 py-3 font-medium text-slate-700">{u.name}</td>
                      <td className="px-4 py-3 text-slate-500">{u.email}</td>
                      <td className="px-4 py-3 capitalize text-slate-600">{u.role}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${u.isActive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                          {u.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {u.role !== "admin" && (
                          <button onClick={() => toggleActive(u)} className="text-xs font-semibold text-brand-600 hover:underline">
                            {u.isActive ? "Deactivate" : "Activate"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`h-8 w-8 rounded-lg text-xs font-medium ${
                    p === page ? "bg-brand-600 text-white" : "bg-white border border-slate-200 text-slate-600"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
