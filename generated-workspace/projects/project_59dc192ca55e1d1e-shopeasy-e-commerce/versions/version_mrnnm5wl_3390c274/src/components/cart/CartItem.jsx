import { Group, Image, Text, ActionIcon, rem } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { useCart } from "../../context/CartContext";
import formatPrice from "../../lib/formatPrice";
import QuantitySelector from "../common/QuantitySelector";
import { products } from "../../data/products";

const CartItem = ({ item }) => {
  const { removeFromCart, updateQuantity } = useCart();

  if (!item) {
    return null;
  }

  const { productId, quantity, priceAtAdd } = item;

  // Get product info from products data
  const product = products.find((p) => p.id === productId) || null;

  if (!product) {
    return null;
  }

  const { name, image, stock } = product;

  const handleQuantityChange = (newQuantity) => {
    if (updateQuantity) {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleRemove = () => {
    if (removeFromCart) {
      removeFromCart(productId);
    }
  };

  return (
    <Group position="apart" align="flex-start" spacing="md" mb="md">
      <Group spacing="sm" align="flex-start" style={{ flex: 1 }}>
        <Image
          src={image}
          alt={name}
          width={rem(80)}
          height={rem(80)}
          style={{ objectFit: "cover", borderRadius: rem(8) }}
        />
        <div>
          <Text weight={500} size="sm" lineClamp={2} mb={4}>
            {name}
          </Text>
          <Text weight={700} size="sm" color="success.6">
            {formatPrice(priceAtAdd)}
          </Text>
        </div>
      </Group>

      <Group spacing="sm" align="center">
        <QuantitySelector
          value={quantity}
          onChange={handleQuantityChange}
          min={1}
          max={stock}
        />
        <ActionIcon
          variant="subtle"
          color="error"
          size="sm"
          onClick={handleRemove}
          aria-label="Remove item"
        >
          <IconTrash size={rem(16)} />
        </ActionIcon>
      </Group>
    </Group>
  );
};

export default CartItem;