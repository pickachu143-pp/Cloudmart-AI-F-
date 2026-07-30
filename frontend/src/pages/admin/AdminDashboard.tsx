import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, Package, ClipboardList, DollarSign, AlertTriangle, Tags } from "lucide-react";
import { DashboardStats } from "../../types";
import { adminService } from "../../services/adminService";
import AdminSidebar from "../../components/AdminSidebar";
import StatusBadge from "../../components/StatusBadge";
import Loader from "../../components/Loader";

const StatCard: React.FC<{ icon: React.ElementType; label: string; value: string | number; tone?: string }> = ({
  icon: Icon,
  label,
  value,
  tone = "bg-brand-50 text-brand-600",
}) => (
  <div className="card p-5 flex items-center gap-4">
    <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${tone}`}>
      <Icon size={20} />
    </div>
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-xl font-bold text-slate-900">{value}</p>
    </div>
  </div>
);

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getDashboardStats().then(setStats).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Admin Dashboard</h1>

      <div className="flex flex-col md:flex-row gap-6">
        <AdminSidebar />

        <div className="flex-1 space-y-6">
          {loading || !stats ? (
            <Loader />
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard icon={DollarSign} label="Total Revenue" value={`$${stats.totalRevenue.toFixed(2)}`} tone="bg-emerald-50 text-emerald-600" />
                <StatCard icon={ClipboardList} label="Total Orders" value={stats.orderCount} />
                <StatCard icon={Users} label="Customers" value={stats.userCount} />
                <StatCard icon={Package} label="Active Products" value={stats.productCount} />
                <StatCard icon={Tags} label="Categories" value={stats.categoryCount} />
                <StatCard icon={AlertTriangle} label="Low Stock Items" value={stats.lowStockCount} tone="bg-amber-50 text-amber-600" />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="card p-5">
                  <h2 className="font-semibold text-slate-800 mb-4">Orders by Status</h2>
                  <div className="space-y-3">
                    {Object.entries(stats.ordersByStatus).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between text-sm">
                        <span className="capitalize text-slate-600">{status}</span>
                        <span className="font-semibold text-slate-800">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-slate-800">Recent Orders</h2>
                    <Link to="/admin/orders" className="text-xs font-semibold text-brand-600 hover:underline">
                      View all
                    </Link>
                  </div>
                  <div className="space-y-3">
                    {stats.recentOrders.map((order) => (
                      <div key={order._id} className="flex items-center justify-between text-sm">
                        <div>
                          <p className="font-medium text-slate-700">{order.orderNumber}</p>
                          <p className="text-xs text-slate-400">
                            {typeof order.user === "object" ? order.user.name : "Customer"}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-slate-800">${order.grandTotal.toFixed(2)}</span>
                          <StatusBadge status={order.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
