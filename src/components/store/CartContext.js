'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { formatPrice as formatPriceUtil } from '@/lib/utils';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [settings, setSettings] = useState(null);

  // Initialize cart & settings
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ar_fashion_cart');
      if (saved) {
        setCart(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoaded(true);
    }

    async function loadStoreSettings() {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (data.success && data.settings) {
          setSettings(data.settings);
          if (typeof window !== 'undefined') {
            window.__STORE_CURRENCY_SYMBOL__ = data.settings.currencySymbol || '₹';
            localStorage.setItem('ar_currency_symbol', data.settings.currencySymbol || '₹');
            localStorage.setItem('ar_currency_code', data.settings.currency || 'INR');
          }
        }
      } catch (err) {
        console.error('Failed to load store settings:', err);
      }
    }

    loadStoreSettings();

    const handleSettingsUpdate = (e) => {
      if (e?.detail) {
        setSettings(e.detail);
        if (typeof window !== 'undefined') {
          window.__STORE_CURRENCY_SYMBOL__ = e.detail.currencySymbol || '₹';
          localStorage.setItem('ar_currency_symbol', e.detail.currencySymbol || '₹');
        }
      } else {
        loadStoreSettings();
      }
    };

    window.addEventListener('store_settings_updated', handleSettingsUpdate);
    return () => window.removeEventListener('store_settings_updated', handleSettingsUpdate);
  }, []);

  // Save on changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('ar_fashion_cart', JSON.stringify(cart));
    }
  }, [cart, isLoaded]);

  const addToCart = (product, variant, quantity = 1) => {
    const cartItemId = `${product.id}_${variant.id}`;
    const unitPrice = variant.price !== null && variant.price !== undefined ? variant.price : product.sellingPrice;

    setCart((prev) => {
      const existing = prev.find((i) => i.id === cartItemId);
      if (existing) {
        const newQty = Math.min(variant.stock, existing.quantity + quantity);
        return prev.map((item) =>
          item.id === cartItemId ? { ...item, quantity: newQty } : item
        );
      } else {
        return [
          ...prev,
          {
            id: cartItemId,
            productId: product.id,
            productName: product.name,
            productImage: product.mainImage,
            variantId: variant.id,
            colour: variant.colour,
            colourCode: variant.colourCode || '#1E293B',
            size: variant.size,
            sku: variant.sku || product.sku,
            unitPrice,
            quantity: Math.min(variant.stock, quantity),
            maxStock: variant.stock,
          },
        ];
      }
    });

    setDrawerOpen(true);
  };

  const updateQuantity = (cartItemId, quantity) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === cartItemId) {
            const validQty = Math.max(1, Math.min(item.maxStock, quantity));
            return { ...item, quantity: validQty };
          }
          return item;
        })
        .filter((i) => i.quantity > 0)
    );
  };

  const removeFromCart = (cartItemId) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  const currencySymbol = settings?.currencySymbol || (typeof window !== 'undefined' ? localStorage.getItem('ar_currency_symbol') : null) || '₹';
  const formatPrice = (amount) => formatPriceUtil(amount, currencySymbol);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalCount,
        subtotal,
        drawerOpen,
        setDrawerOpen,
        settings,
        currencySymbol,
        formatPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
