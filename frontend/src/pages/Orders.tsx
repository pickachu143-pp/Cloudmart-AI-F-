import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PackageSearch } from "lucide-react";
import { Order } from "../types";
import { orderService } from "../services/orderService";
import StatusBadge from "../components/StatusBadge";
import Loader from "../components/Loader";

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService.myOrders().then(setOrders).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader fullScreen />;

  if (orders.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <PackageSearch size={40} className="mx-auto text-slate-300 mb-4" />
        <h1 className="text-xl font-bold text-slate-800">No orders yet</h1>
        <p className="text-slate-500 mt-2 mb-6">Your order history will show up here once you check out.</p>
        <Link to="/products" className="btn-primary">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Order History</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <Link
            to={`/orders/${order._id}`}
            key={order._id}
            className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:shadow-lg transition"
          >
            <div>
              <p className="font-semibold text-slate-800">{order.orderNumber}</p>
              <p className="text-sm text-slate-500 mt-0.5">
                {new Date(order.createdAt).toLocaleDateString()} &middot; {order.items.length} item(s)
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-bold text-slate-900">${order.grandTotal.toFixed(2)}</span>
              <StatusBadge status={order.status} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Orders;
