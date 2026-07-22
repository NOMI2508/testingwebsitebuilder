import { Card, Image, Text, Group, Badge, Rating, Button, Box, Skeleton } from "@mantine/core";
import { IconShoppingCart } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import formatPrice from "../../lib/formatPrice";

const ProductCard = ({ product, loading = false }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product && addToCart) {
      addToCart(product.id, 1);
    }
  };

  if (loading) {
    return (
      <Card>
        <Skeleton height={200} mb="sm" />
        <Skeleton height={20} width="70%" mb="xs" />
        <Skeleton height={16} width="50%" mb="md" />
        <Group position="apart">
          <Skeleton height={24} width={60} />
          <Skeleton height={32} width={100} />
        </Group>
      </Card>
    );
  }

  if (!product) {
    return null;
  }

  const { id, name, price, category, image, rating } = product;

  return (
    <Card component={Link} to={`/product/${id}`} shadow="sm" padding="lg" radius="lg" style={{ textDecoration: "none" }}>
      <Card.Section>
        <Image
          src={image}
          alt={name}
          height={200}
          style={{ objectFit: "cover" }}
        />
      </Card.Section>

      <Box mt="md">
        <Group position="apart" mb="xs">
          <Text weight={500} size="sm" lineClamp={2}>
            {name}
          </Text>
          <Badge color="brand" variant="light" size="sm">
            {category}
          </Badge>
        </Group>

        <Group position="apart" mb="md">
          <Text weight={700} size="lg" color="success.6">
            {formatPrice(price)}
          </Text>
          <Rating value={rating} fractions={2} size="sm" readOnly />
        </Group>

        <Button
          leftIcon={<IconShoppingCart size={16} />}
          variant="light"
          color="brand"
          fullWidth
          size="sm"
          onClick={handleAddToCart}
        >
          Add to Cart
        </Button>
      </Box>
    </Card>
  );
};

export default ProductCard;