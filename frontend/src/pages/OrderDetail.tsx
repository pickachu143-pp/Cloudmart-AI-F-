import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Order } from "../types";
import { orderService } from "../services/orderService";
import StatusBadge from "../components/StatusBadge";
import Loader from "../components/Loader";

const STEPS: Order["status"][] = ["pending", "processing", "shipped", "delivered"];

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    orderService.getById(id).then(setOrder).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader fullScreen />;
  if (!order) return <div className="text-center py-24 text-slate-500">Order not found.</div>;

  const currentStepIndex = STEPS.indexOf(order.status);
  const isCancelled = order.status === "cancelled";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{order.orderNumber}</h1>
          <p className="text-sm text-slate-500 mt-1">Placed on {new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Tracking progress */}
      {!isCancelled && (
        <div className="card p-6 mb-8">
          <div className="flex items-center justify-between relative">
            {STEPS.map((step, idx) => (
              <div key={step} className="flex-1 flex flex-col items-center relative z-10">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                    idx <= currentStepIndex
                      ? "bg-brand-600 border-brand-600 text-white"
                      : "bg-white border-slate-300 text-slate-400"
                  }`}
                >
                  {idx + 1}
                </div>
                <span className="text-xs mt-2 capitalize text-slate-600 text-center">{step}</span>
              </div>
            ))}
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-slate-200 -z-0" />
            <div
              className="absolute top-4 left-0 h-0.5 bg-brand-600 transition-all -z-0"
              style={{ width: `${(currentStepIndex / (STEPS.length - 1)) * 100}%` }}
            />
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="card p-5">
            <h2 className="font-semibold text-slate-800 mb-4">Items</h2>
            {order.items.map((item) => (
              <div key={item.product} className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-b-0 text-sm">
                <span className="text-slate-700">{item.name} &times; {item.quantity}</span>
                <span className="font-medium text-slate-800">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="card p-5">
            <h2 className="font-semibold text-slate-800 mb-3">Status History</h2>
            <ul className="space-y-3">
              {order.statusHistory.slice().reverse().map((event, idx) => (
                <li key={idx} className="text-sm">
                  <span className="font-medium text-slate-700 capitalize">{event.status}</span>
                  <span className="text-slate-400"> &middot; {new Date(event.timestamp).toLocaleString()}</span>
                  {event.note && <p className="text-slate-500 mt-0.5">{event.note}</p>}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-5">
            <h2 className="font-semibold text-slate-800 mb-3">Shipping Address</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {order.shippingAddress.fullName}
              <br />
              {order.shippingAddress.line1}
              <br />
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
              <br />
              {order.shippingAddress.country}
            </p>
          </div>

          <div className="card p-5">
            <h2 className="font-semibold text-slate-800 mb-3">Payment Summary</h2>
            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex justify-between"><span>Items</span><span>${order.itemsTotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>${order.shippingFee.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Tax</span><span>${order.tax.toFixed(2)}</span></div>
            </div>
            <div className="flex justify-between font-bold text-slate-900 mt-3 pt-3 border-t border-slate-100">
              <span>Total</span><span>${order.grandTotal.toFixed(2)}</span>
            </div>
            <p className="text-xs text-slate-400 mt-3 capitalize">
              Paid via {order.paymentMethod} &middot; {order.paymentStatus}
            </p>
          </div>
        </div>
      </div>

      <Link to="/orders" className="inline-block mt-8 text-sm font-semibold text-brand-600 hover:underline">
        &larr; Back to Order History
      </Link>
    </div>
  );
};

export default OrderDetail;
