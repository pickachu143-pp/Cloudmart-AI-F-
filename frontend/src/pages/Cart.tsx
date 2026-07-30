import React from "react";
import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { useCart } from "../hooks/useCart";
import CartItemRow from "../components/CartItemRow";

const SHIPPING_FLAT_FEE = 5.99;
const TAX_RATE = 0.08;

const Cart: React.FC = () => {
  const { cart, subtotal, isLoading } = useCart();
  const tax = subtotal * TAX_RATE;
  const total = subtotal > 0 ? subtotal + SHIPPING_FLAT_FEE + tax : 0;

  if (isLoading) {
    return <div className="text-center py-24 text-slate-500">Loading your cart...</div>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <ShoppingBag size={40} className="mx-auto text-slate-300 mb-4" />
        <h1 className="text-xl font-bold text-slate-800">Your cart is empty</h1>
        <p className="text-slate-500 mt-2 mb-6">Browse the catalog and add something you like.</p>
        <Link to="/products" className="btn-primary">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Your Cart</h1>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 card p-5">
          {cart.items.map((item) => (
            <CartItemRow key={item.product._id} item={item} />
          ))}
        </div>

        <div className="card p-5 h-fit">
          <h2 className="font-semibold text-slate-800 mb-4">Order Summary</h2>
          <div className="space-y-2 text-sm text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>${SHIPPING_FLAT_FEE.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (est.)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
          </div>
          <div className="flex justify-between font-bold text-slate-900 text-base mt-4 pt-4 border-t border-slate-100">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <Link to="/checkout" className="btn-primary w-full mt-6">
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;
