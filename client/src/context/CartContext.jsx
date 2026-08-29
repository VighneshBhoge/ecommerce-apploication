import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "../api/client.js";
import { useAuth } from "./AuthContext.jsx";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], subtotal: 0, count: 0 });

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCart({ items: [], subtotal: 0, count: 0 });
      return;
    }
    try {
      const data = await api("/cart");
      setCart(data);
    } catch {
      setCart({ items: [], subtotal: 0, count: 0 });
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  async function addItem(productId, quantity = 1) {
    const data = await api("/cart", {
      method: "POST",
      body: { productId, quantity },
    });
    setCart(data);
    return data;
  }

  async function updateItem(itemId, quantity) {
    const data = await api(`/cart/${itemId}`, {
      method: "PATCH",
      body: { quantity },
    });
    setCart(data);
    return data;
  }

  async function removeItem(itemId) {
    const data = await api(`/cart/${itemId}`, { method: "DELETE" });
    setCart(data);
    return data;
  }

  return (
    <CartContext.Provider value={{ cart, addItem, updateItem, removeItem, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
