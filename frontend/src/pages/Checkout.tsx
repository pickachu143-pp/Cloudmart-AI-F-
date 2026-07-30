import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { CreditCard, Truck, Wallet } from "lucide-react";
import { useCart } from "../hooks/useCart";
import { orderService } from "../services/orderService";
import { PaymentMethod, ShippingAddress } from "../types";

const SHIPPING_FLAT_FEE = 5.99;
const TAX_RATE = 0.08;

const paymentOptions: { value: PaymentMethod; label: string; icon: React.ElementType }[] = [
  { value: "card", label: "Credit / Debit Card", icon: CreditCard },
  { value: "wallet", label: "Digital Wallet", icon: Wallet },
  { value: "cod", label: "Cash on Delivery", icon: Truck },
];

const Checkout: React.FC = () => {
  const { cart, subtotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [address, setAddress] = useState<ShippingAddress>({
    fullName: "",
    line1: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [submitting, setSubmitting] = useState(false);

  const tax = subtotal * TAX_RATE;
  const total = subtotal + SHIPPING_FLAT_FEE + tax;

  const handleChange = (field: keyof ShippingAddress) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart || cart.items.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }
    setSubmitting(true);
    try {
      const order = await orderService.checkout(address, paymentMethod);
      await clearCart();
      toast.success("Order placed successfully!");
      navigate(`/orders/${order._id}`);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="font-semibold text-slate-800 mb-4">Shipping Address</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="label">Full Name</label>
                <input required className="input" value={address.fullName} onChange={handleChange("fullName")} />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Address Line</label>
                <input required className="input" value={address.line1} onChange={handleChange("line1")} />
              </div>
              <div>
                <label className="label">City</label>
                <input required className="input" value={address.city} onChange={handleChange("city")} />
              </div>
              <div>
                <label className="label">State / Province</label>
                <input required className="input" value={address.state} onChange={handleChange("state")} />
              </div>
              <div>
                <label className="label">Postal Code</label>
                <input required className="input" value={address.postalCode} onChange={handleChange("postalCode")} />
              </div>
              <div>
                <label className="label">Country</label>
                <input required className="input" value={address.country} onChange={handleChange("country")} />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-semibold text-slate-800 mb-4">Payment Method</h2>
            <p className="text-xs text-slate-400 mb-4">
              This is a simulated payment flow for demo purposes — no real charge occurs.
            </p>
            <div className="grid sm:grid-cols-3 gap-3">
              {paymentOptions.map(({ value, label, icon: Icon }) => (
                <button
                  type="button"
                  key={value}
                  onClick={() => setPaymentMethod(value)}
                  className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-sm font-medium transition ${
                    paymentMethod === value ? "border-brand-600 bg-brand-50 text-brand-700" : "border-slate-200 text-slate-600 hover:border-brand-300"
                  }`}
                >
                  <Icon size={20} />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="card p-5 h-fit">
          <h2 className="font-semibold text-slate-800 mb-4">Order Summary</h2>
          <div className="space-y-2 text-sm text-slate-600 max-h-56 overflow-y-auto pr-1">
            {cart?.items.map((item) => (
              <div key={item.product._id} className="flex justify-between">
                <span className="line-clamp-1 pr-2">
                  {item.product.name} &times; {item.quantity}
                </span>
                <span className="shrink-0">${(item.priceAtAdd * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="space-y-2 text-sm text-slate-600 mt-4 pt-4 border-t border-slate-100">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>${SHIPPING_FLAT_FEE.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>${tax.toFixed(2)}</span>
            </div>
          </div>
          <div className="flex justify-between font-bold text-slate-900 text-base mt-4 pt-4 border-t border-slate-100">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full mt-6">
            {submitting ? "Placing order..." : "Place Order"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
