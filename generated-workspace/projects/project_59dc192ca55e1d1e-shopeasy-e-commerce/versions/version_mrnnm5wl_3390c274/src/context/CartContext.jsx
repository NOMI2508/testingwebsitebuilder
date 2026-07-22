import { createContext, useContext, useEffect, useState } from "react";
import { products } from "../data/products";

const CartContext = createContext();

const CART_STORAGE_KEY = "shopeasy_cart";

const getStoredCart = () => {
  try {
    const stored = sessionStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    return [];
  }
};

const storeCart = (cartItems) => {
  try {
    sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  } catch (error) {
    // Silently fail if storage is not available
  }
};

const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    setCartItems(getStoredCart());
  }, []);

  useEffect(() => {
    storeCart(cartItems);
  }, [cartItems]);

  const addToCart = (productId, quantity = 1) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.productId === productId);
      if (existingItem) {
        const newQuantity = Math.min(
          existingItem.quantity + quantity,
          product.stock
        );
        return prevItems.map((item) =>
          item.productId === productId
            ? { ...item, quantity: newQuantity }
            : item
        );
      }
      return [...prevItems, { productId, quantity, priceAtAdd: product.price }];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.productId !== productId)
    );
  };

  const updateQuantity = (productId, quantity) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const validQuantity = Math.max(1, Math.min(quantity, product.stock));

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.productId === productId
          ? { ...item, quantity: validQuantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + item.priceAtAdd * item.quantity;
    }, 0);
  };

  const getCartItemCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  const getItemByProductId = (productId) => {
    return cartItems.find((item) => item.productId === productId);
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount,
    getItemByProductId,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export { CartProvider, useCart };
export default CartContext;