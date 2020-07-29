import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const cartProducts = await AsyncStorage.getItem(`@GoMarket:Cart`);

      if (cartProducts) {
        setProducts(JSON.parse(cartProducts));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(async (product: Product) => {
    // TODO ADD A NEW ITEM TO THE CART
    const productsStorage = await AsyncStorage.getItem(`@GoMarket:Cart`);
    const cartProducts = productsStorage
      ? (JSON.parse(productsStorage) as Product[])
      : ([] as Product[]);

    const index = cartProducts.findIndex(find => find.id === product.id);

    if (index >= 0) {
      cartProducts[index].quantity += 1;
    } else {
      cartProducts.push({ ...product, quantity: 1 });
    }

    setProducts(cartProducts);
    await AsyncStorage.setItem(`@GoMarket:Cart`, JSON.stringify(cartProducts));
  }, []);

  const increment = useCallback(async id => {
    // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
    const productsStorage = await AsyncStorage.getItem(`@GoMarket:Cart`);
    const cartProducts = productsStorage
      ? (JSON.parse(productsStorage) as Product[])
      : ([] as Product[]);

    const index = cartProducts.findIndex(search => search.id === id);

    cartProducts[index].quantity += 1;

    setProducts(cartProducts);
    await AsyncStorage.setItem(`@GoMarket:Cart`, JSON.stringify(cartProducts));
  }, []);

  const decrement = useCallback(async id => {
    // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
    const productsStorage = await AsyncStorage.getItem(`@GoMarket:Cart`);
    const cartProducts = productsStorage
      ? (JSON.parse(productsStorage) as Product[])
      : ([] as Product[]);

    const index = cartProducts.findIndex(search => search.id === id);

    cartProducts[index].quantity > 1
      ? (cartProducts[index].quantity -= 1)
      : cartProducts.splice(index, 1);

    setProducts(cartProducts);
    await AsyncStorage.setItem(`@GoMarket:Cart`, JSON.stringify(cartProducts));
  }, []);

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
