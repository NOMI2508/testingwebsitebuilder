import { Card, Image, Text, Group, Badge, Button, ActionIcon, Box, rem } from "@mantine/core";
import { IconHeart, IconEye, IconShoppingCart } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import RatingStars from "./RatingStars";
import formatPrice from "../../lib/formatPrice";

const ProductCard = ({ product, onQuickView, onAddToCart }) => {
  const [hovered, { hover }] = useDisclosure(false);
  
  const safeProduct = product || {};
  const name = safeProduct.name || "Unnamed Product";
  const price = typeof safeProduct.price === "number" ? safeProduct.price : 0;
  const salePrice = typeof safeProduct.salePrice === "number" ? safeProduct.salePrice : null;
  const rating = typeof safeProduct.rating === "number" ? safeProduct.rating : 0;
  const reviewCount = typeof safeProduct.reviewCount === "number" ? safeProduct.reviewCount : 0;
  const category = safeProduct.category || "uncategorized";
  const image = safeProduct.images?.[0] || "";
  const inStock = safeProduct.inStock !== false;

  const displayPrice = salePrice || price;
  const hasDiscount = salePrice && salePrice < price;

  const handleAddToCart = () => {
    if (onAddToCart && inStock) {
      onAddToCart(safeProduct);
    }
  };

  const handleQuickView = () => {
    if (onQuickView) {
      onQuickView(safeProduct);
    }
  };

  return (
    <Card
      shadow="sm"
      padding="md"
      radius="md"
      style={{
        transition: "transform 150ms ease, box-shadow 150ms ease",
        transform: hovered ? "translateY(-4px)" : "none",
        ...(hovered && { boxShadow: "xl" })
      }}
      {...hover}
    >
      <Box pos="relative">
        <Image
          src={image}
          alt={name}
          height={200}
          fit="cover"
          radius="md"
          fallbackSrc="https://placehold.co/400x400?text=Product+Image"
        />
        {hasDiscount && (
          <Badge
            color="gold"
            variant="filled"
            pos="absolute"
            top={8}
            right={8}
            size="sm"
          >
            Sale
          </Badge>
        )}
        <Group pos="absolute" top={8} left={8} gap={4}>
          <ActionIcon
            variant="white"
            size="sm"
            radius="xl"
            aria-label="Add to wishlist"
            style={{ opacity: 0.9 }}
          >
            <IconHeart size={rem(16)} />
          </ActionIcon>
        </Group>
      </Box>

      <Group justify="space-between" mt="md" mb="xs">
        <Text fw={600} size="sm" lineClamp={1}>
          {name}
        </Text>
        <Badge variant="light" color="slate" size="xs">
          {category}
        </Badge>
      </Group>

      <Group gap="xs" mb="md">
        <RatingStars rating={rating} reviewCount={reviewCount} />
      </Group>

      <Group justify="space-between" align="center">
        <Group gap="xs">
          <Text fw={700} size="md">
            {formatPrice(displayPrice)}
          </Text>
          {hasDiscount && (
            <Text size="xs" c="dimmed" td="line-through">
              {formatPrice(price)}
            </Text>
          )}
        </Group>
        <Group gap={4}>
          <ActionIcon
            variant="subtle"
            size="sm"
            radius="xl"
            aria-label="Quick view"
            onClick={handleQuickView}
          >
            <IconEye size={rem(16)} />
          </ActionIcon>
          <ActionIcon
            variant="filled"
            size="sm"
            radius="xl"
            aria-label="Add to cart"
            onClick={handleAddToCart}
            disabled={!inStock}
          >
            <IconShoppingCart size={rem(16)} />
          </ActionIcon>
        </Group>
      </Group>
    </Card>
  );
};

export default ProductCard;