import { useCartContext } from "../context/CartContext";

/** Thin re-export so components can `import { useCart } from "@/hooks/useCart"`. */
export const useCart = useCartContext;
