import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  imageUrl: string;
  wholesalePrice: number;
  sellingPrice: number;
  quantity: number;
  selectedVariant?: string;
  selectedSize?: string;
  minSellingPrice: number;
  maxSellingPrice: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateSellingPrice: (id: string, price: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getWholesaleTotal: () => number;
  getSellingTotal: () => number;
  getProfit: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from storage on mount
  useEffect(() => {
    loadCart();
  }, []);

  // Save cart to storage whenever it changes
  useEffect(() => {
    saveCart();
  }, [items]);

  const loadCart = async () => {
    try {
      const cartData = await AsyncStorage.getItem('cart');
      if (cartData) {
        setItems(JSON.parse(cartData));
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  const saveCart = async () => {
    try {
      await AsyncStorage.setItem('cart', JSON.stringify(items));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  };

  const addToCart = (item: CartItem) => {
    setItems((prevItems) => {
      // Check if item already exists
      const existingIndex = prevItems.findIndex(
        (i) => i.productId === item.productId && 
               i.selectedVariant === item.selectedVariant && 
               i.selectedSize === item.selectedSize
      );

      if (existingIndex >= 0) {
        // Update quantity if exists
        const updatedItems = [...prevItems];
        updatedItems[existingIndex].quantity += item.quantity;
        return updatedItems;
      } else {
        // Add new item with unique ID
        return [...prevItems, { ...item, id: Date.now().toString() }];
      }
    });
  };

  const removeFromCart = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(id);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const updateSellingPrice = (id: string, price: number) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, sellingPrice: price } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getWholesaleTotal = () => {
    return items.reduce((total, item) => total + (item.wholesalePrice * item.quantity), 0);
  };

  const getSellingTotal = () => {
    return items.reduce((total, item) => total + (item.sellingPrice * item.quantity), 0);
  };

  const getProfit = () => {
    return getSellingTotal() - getWholesaleTotal();
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateSellingPrice,
        clearCart,
        getTotalItems,
        getWholesaleTotal,
        getSellingTotal,
        getProfit,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
