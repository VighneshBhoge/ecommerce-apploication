import { createContext, useContext, useCallback, useEffect, useState } from "react";
import { api } from "../api/client.js";
import { useAuth } from "./AuthContext.jsx";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [ids, setIds] = useState(new Set());

  const refresh = useCallback(async () => {
    if (!user) {
      setItems([]);
      setIds(new Set());
      return;
    }
    try {
      const data = await api("/wishlist");
      setItems(data.items);
      setIds(new Set(data.items.map((i) => i.productId)));
    } catch {
      setItems([]);
      setIds(new Set());
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function add(productId) {
    await api("/wishlist", { method: "POST", body: { productId } });
    await refresh();
  }

  async function remove(productId) {
    await api(`/wishlist/${productId}`, { method: "DELETE" });
    await refresh();
  }

  async function toggle(productId) {
    if (ids.has(productId)) await remove(productId);
    else await add(productId);
  }

  return (
    <WishlistContext.Provider value={{ items, ids, count: items.length, add, remove, toggle, refresh }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
