import { Stack, Group, Text, Button, ActionIcon, Divider, Paper, rem } from "@mantine/core";
import { IconShoppingCart, IconHeart } from "@tabler/icons-react";
import RatingStars from "../common/RatingStars";
import SizeSelector from "./SizeSelector";
import ColorSelector from "./ColorSelector";
import QuantityControl from "./QuantityControl";
import formatPrice from "../../lib/formatPrice";

const ProductInfo = ({ 
  product, 
  selectedSize, 
  selectedColor, 
  quantity,
  onSizeSelect,
  onColorSelect,
  onQuantityChange,
  onAddToCart 
}) => {
  const safeProduct = product || {};
  const name = safeProduct.name || "Unnamed Product";
  const price = typeof safeProduct.price === "number" ? safeProduct.price : 0;
  const salePrice = typeof safeProduct.salePrice === "number" ? safeProduct.salePrice : null;
  const rating = typeof safeProduct.rating === "number" ? safeProduct.rating : 0;
  const reviewCount = typeof safeProduct.reviewCount === "number" ? safeProduct.reviewCount : 0;
  const description = safeProduct.description || "";
  const sizes = Array.isArray(safeProduct.sizes) ? safeProduct.sizes : [];
  const colors = Array.isArray(safeProduct.colors) ? safeProduct.colors : [];
  const material = safeProduct.material || "";
  const inStock = safeProduct.inStock !== false;

  const displayPrice = salePrice || price;
  const hasDiscount = salePrice && salePrice < price;

  const handleAddToCart = () => {
    if (onAddToCart && inStock && selectedSize) {
      onAddToCart();
    }
  };

  return (
    <Stack gap="lg">
      <div>
        <Group justify="space-between" align="flex-start" mb="xs">
          <div>
            <Text size="xl" fw={700} lh={1.2}>
              {name}
            </Text>
            <Group gap="xs" mt="xs">
              <RatingStars rating={rating} reviewCount={reviewCount} />
            </Group>
          </div>
          <Group gap="xs" align="flex-end">
            <Text fw={700} size="xl" c="gold">
              {formatPrice(displayPrice)}
            </Text>
            {hasDiscount && (
              <Text size="sm" c="dimmed" td="line-through">
                {formatPrice(price)}
              </Text>
            )}
          </Group>
        </Group>

        <Text size="sm" c="dimmed" lh={1.6}>
          {description}
        </Text>
      </div>

      <Divider />

      <SizeSelector
        sizes={sizes}
        selectedSize={selectedSize}
        onSelectSize={onSizeSelect}
      />

      <ColorSelector
        colors={colors}
        selectedColor={selectedColor}
        onSelectColor={onColorSelect}
      />

      <QuantityControl
        quantity={quantity}
        min={1}
        max={10}
        onChange={onQuantityChange}
      />

      <Group gap="md" mt="md">
        <Button
          leftSection={<IconShoppingCart size={rem(18)} />}
          size="md"
          radius="md"
          onClick={handleAddToCart}
          disabled={!inStock || !selectedSize}
          style={{ flex: 1 }}
        >
          Add to Cart
        </Button>
        <ActionIcon
          variant="outline"
          size="md"
          radius="md"
          aria-label="Add to wishlist"
        >
          <IconHeart size={rem(18)} />
        </ActionIcon>
      </Group>

      {material && (
        <Paper p="md" radius="md" bg="slate.0">
          <Text size="sm" fw={500} mb={4}>
            Materials
          </Text>
          <Text size="sm" c="dimmed">
            {material}
          </Text>
        </Paper>
      )}

      <Paper p="md" radius="md" bg="slate.0">
        <Text size="sm" fw={500} mb={4}>
          Shipping & Returns
        </Text>
        <Text size="sm" c="dimmed">
          Free shipping on orders over $150. 30-day free returns. Crafted with care and delivered with pride.
        </Text>
      </Paper>
    </Stack>
  );
};

export default ProductInfo;