import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';
import formatValue from '../utils/formatValue';

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
  cartTotal(): number;
  totalItensInCart(): number;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const cartProducts = await AsyncStorage.getItem(
        `@GoMarketplace:products`,
      );

      if (cartProducts) {
        setProducts(JSON.parse(cartProducts));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async (product: Product) => {
      const productExists = products.find(p => p.id === product.id);

      let newProducts = [] as Product[];
      if (productExists) {
        newProducts = products.map(p =>
          p.id === product.id ? { ...product, quantity: p.quantity + 1 } : p,
        );
      } else {
        newProducts = [...products, { ...product, quantity: 1 }];
      }

      setProducts(newProducts);
      await AsyncStorage.setItem(
        `@GoMarketplace:products`,
        JSON.stringify(newProducts),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const newProducts = products.map(product =>
        product.id === id
          ? { ...product, quantity: product.quantity + 1 }
          : product,
      );

      setProducts(newProducts);

      await AsyncStorage.setItem(
        `@GoMarketplace:products`,
        JSON.stringify(newProducts),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const newProducts = products.map(product =>
        product.id === id
          ? { ...product, quantity: product.quantity - 1 }
          : product,
      );

      const finalProducts = newProducts.filter(product => product.quantity > 0);

      setProducts(finalProducts);

      await AsyncStorage.setItem(
        `@GoMarketplace:products`,
        JSON.stringify(finalProducts),
      );
    },
    [products],
  );

  const cartTotal = useCallback(() => {
    const total = products.reduce((accumulator, product) => {
      return accumulator + product.quantity * product.price;
    }, 0);

    return formatValue(total);
  }, [products]);

  const totalItensInCart = useCallback(() => {
    const total = products.reduce((accumulator, product) => {
      return accumulator + product.quantity;
    }, 0);

    return total;
  }, [products]);

  const value = React.useMemo(
    () => ({
      addToCart,
      increment,
      decrement,
      products,
      cartTotal,
      totalItensInCart,
    }),
    [products, addToCart, increment, decrement, cartTotal, totalItensInCart],
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
