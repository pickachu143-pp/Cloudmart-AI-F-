import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Order, OrderStatus, PaginatedMeta } from "../../types";
import { adminService } from "../../services/adminService";
import AdminSidebar from "../../components/AdminSidebar";
import StatusBadge from "../../components/StatusBadge";
import Loader from "../../components/Loader";

const STATUS_OPTIONS: OrderStatus[] = ["pending", "processing", "shipped", "delivered", "cancelled"];

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [meta, setMeta] = useState<PaginatedMeta | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    adminService
      .getAllOrders(page, 20, statusFilter || undefined)
      .then(({ orders, meta }) => {
        setOrders(orders);
        setMeta(meta);
      })
      .finally(() => setLoading(false));
  };

  useEffect(loadData, [page, statusFilter]);

  const handleStatusChange = async (id: string, status: OrderStatus) => {
    try {
      await adminService.updateOrderStatus(id, status);
      toast.success("Order status updated.");
      loadData();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-slate-900">Manage Orders</h1>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="input !w-auto"
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
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
                    <th className="px-4 py-3 font-medium">Order</th>
                    <th className="px-4 py-3 font-medium">Customer</th>
                    <th className="px-4 py-3 font-medium">Total</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Update</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id} className="border-b border-slate-50 last:border-b-0 hover:bg-slate-50/60">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-700">{order.orderNumber}</p>
                        <p className="text-xs text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {typeof order.user === "object" ? `${order.user.name} (${order.user.email})` : order.user}
                      </td>
                      <td className="px-4 py-3 font-semibold">${order.grandTotal.toFixed(2)}</td>
                      <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                      <td className="px-4 py-3">
                        <select
                          defaultValue=""
                          onChange={(e) => {
                            if (e.target.value) handleStatusChange(order._id, e.target.value as OrderStatus);
                            e.target.value = "";
                          }}
                          className="input !w-auto !py-1.5 text-xs"
                        >
                          <option value="">Change status...</option>
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
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

export default AdminOrders;
