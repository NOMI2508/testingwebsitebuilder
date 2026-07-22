import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("stride-cart");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setCartItems(parsed);
        }
      }
    } catch (error) {
      console.error("Failed to load cart from localStorage:", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("stride-cart", JSON.stringify(cartItems));
    } catch (error) {
      console.error("Failed to save cart to localStorage:", error);
    }
  }, [cartItems]);

  const addItem = (product, quantity = 1, selectedSize, selectedColor) => {
    setCartItems((prev) => {
      const safePrev = Array.isArray(prev) ? prev : [];
      const existingIndex = safePrev.findIndex(
        (item) =>
          item.productId === product.id &&
          item.selectedSize === selectedSize &&
          item.selectedColor === selectedColor
      );

      if (existingIndex >= 0) {
        const updated = [...safePrev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity
        };
        return updated;
      }

      return [
        ...safePrev,
        {
          id: `${product.id}-${Date.now()}`,
          productId: product.id,
          name: product.name,
          price: product.salePrice || product.price,
          image: product.images?.[0] || "",
          quantity,
          selectedSize,
          selectedColor
        }
      ];
    });
  };

  const removeItem = (itemId) => {
    setCartItems((prev) => {
      const safePrev = Array.isArray(prev) ? prev : [];
      return safePrev.filter((item) => item.id !== itemId);
    });
  };

  const updateQuantity = (itemId, quantity) => {
    setCartItems((prev) => {
      const safePrev = Array.isArray(prev) ? prev : [];
      if (quantity <= 0) {
        return safePrev.filter((item) => item.id !== itemId);
      }
      return safePrev.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      );
    });
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    const safeItems = Array.isArray(cartItems) ? cartItems : [];
    return safeItems.reduce(
      (total, item) => total + (item.price || 0) * (item.quantity || 1),
      0
    );
  };

  const getCartCount = () => {
    const safeItems = Array.isArray(cartItems) ? cartItems : [];
    return safeItems.reduce(
      (count, item) => count + (item.quantity || 1),
      0
    );
  };

  const value = {
    cartItems,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext;