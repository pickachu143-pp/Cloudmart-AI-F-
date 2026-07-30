import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { Cart } from "../types";
import { cartService } from "../services/cartService";
import { useAuthContext } from "./AuthContext";

interface CartContextValue {
  cart: Cart | null;
  itemCount: number;
  subtotal: number;
  isLoading: boolean;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthContext();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      return;
    }
    setIsLoading(true);
    try {
      const data = await cartService.get();
      setCart(data);
    } catch {
      // Silently ignore — user may not be fully authenticated yet on first paint.
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addItem = async (productId: string, quantity = 1) => {
    if (!isAuthenticated) {
      toast.error("Please log in to add items to your cart.");
      return;
    }
    try {
      const updated = await cartService.addItem(productId, quantity);
      setCart(updated);
      toast.success("Added to cart.");
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    try {
      const updated = await cartService.updateQuantity(productId, quantity);
      setCart(updated);
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const removeItem = async (productId: string) => {
    try {
      const updated = await cartService.removeItem(productId);
      setCart(updated);
      toast.success("Item removed.");
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const clearCart = async () => {
    try {
      const updated = await cartService.clear();
      setCart(updated);
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const itemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  const subtotal = cart?.items.reduce((sum, item) => sum + item.priceAtAdd * item.quantity, 0) ?? 0;

  const value: CartContextValue = {
    cart,
    itemCount,
    subtotal,
    isLoading,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    refreshCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export function useCartContext(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCartContext must be used within a CartProvider");
  return ctx;
}
