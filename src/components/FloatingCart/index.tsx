import React, { useState, useMemo, useEffect } from 'react';

import { useNavigation } from '@react-navigation/native';

import FeatherIcon from 'react-native-vector-icons/Feather';
import {
  Container,
  CartPricing,
  CartButton,
  CartButtonText,
  CartTotalPrice,
} from './styles';

import { useCart } from '../../hooks/cart';

// Calculo do total
// Navegação no clique do TouchableHighlight

const FloatingCart: React.FC = () => {
  const { totalItensInCart, cartTotal } = useCart();

  const [priceTotal, setPriceTotal] = useState(0);
  const [quantityTotal, setQuantityTotal] = useState(0);

  useEffect(() => {
    setQuantityTotal(totalItensInCart());
  }, [totalItensInCart]);

  useEffect(() => {
    setPriceTotal(cartTotal());
  }, [cartTotal]);

  const navigation = useNavigation();

  return (
    <Container>
      <CartButton
        testID="navigate-to-cart-button"
        onPress={() => navigation.navigate('Cart')}
      >
        <FeatherIcon name="shopping-cart" size={24} color="#fff" />
        <CartButtonText>{`${quantityTotal} itens`}</CartButtonText>
      </CartButton>

      <CartPricing>
        <CartTotalPrice>{priceTotal}</CartTotalPrice>
      </CartPricing>
    </Container>
  );
};

export default FloatingCart;
