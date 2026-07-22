import { Title, Text, Group, Rating, Badge, Button, Box, Divider, Stack } from "@mantine/core";
import { IconShoppingCart, IconPackage, IconTruck } from "@tabler/icons-react";
import { useState } from "react";
import { useCart } from "../../context/CartContext";
import formatPrice from "../../lib/formatPrice";
import QuantitySelector from "../common/QuantitySelector";

const ProductInfo = ({ product }) => {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  if (!product) {
    return null;
  }

  const { name, description, price, category, rating, stock } = product;

  const handleAddToCart = () => {
    if (addToCart) {
      addToCart(product.id, quantity);
    }
  };

  return (
    <Stack spacing="lg">
      <Group position="apart" align="flex-start">
        <Title order={2} size="h2" weight={600}>
          {name}
        </Title>
        <Badge color="brand" variant="light" size="lg">
          {category}
        </Badge>
      </Group>

      <Group spacing="lg">
        <Text weight={700} size="2xl" color="success.6">
          {formatPrice(price)}
        </Text>
        <Rating value={rating} fractions={2} size="lg" readOnly />
      </Group>

      <Text size="md" color="dimmed" style={{ lineHeight: 1.6 }}>
        {description}
      </Text>

      <Divider />

      <Group spacing="md">
        <Text size="sm" weight={500}>
          Quantity:
        </Text>
        <QuantitySelector
          value={quantity}
          onChange={setQuantity}
          min={1}
          max={stock}
        />
      </Group>

      <Group spacing="xs">
        <IconPackage size={18} color="var(--mantine-color-gray-6)" />
        <Text size="sm" color="dimmed">
          {stock} items in stock
        </Text>
      </Group>

      <Group spacing="xs">
        <IconTruck size={18} color="var(--mantine-color-success-6)" />
        <Text size="sm" color="success.6" weight={500}>
          Free shipping on orders over $50
        </Text>
      </Group>

      <Button
        leftIcon={<IconShoppingCart size={18} />}
        size="lg"
        fullWidth
        onClick={handleAddToCart}
      >
        Add to Cart
      </Button>
    </Stack>
  );
};

export default ProductInfo;