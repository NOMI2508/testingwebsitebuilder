import { Container, Group, Text, SimpleGrid, rem } from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";
import { useDisclosure, useState } from "@mantine/hooks";
import ProductCard from "../common/ProductCard";
import RatingStars from "../common/RatingStars";
import mockProducts from "../../data/mockProducts";

const BestSellers = () => {
  const products = Array.isArray(mockProducts) ? mockProducts : [];
  const bestSellers = products
    .sort((a, b) => (b?.reviewCount || 0) - (a?.reviewCount || 0))
    .slice(0, 4);

  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [quickViewOpened, { open: openQuickView, close: closeQuickView }] = useDisclosure(false);

  const handleQuickView = (product) => {
    setQuickViewProduct(product);
    openQuickView();
  };

  return (
    <Container size="lg" py={64} id="best-sellers">
      <Group justify="space-between" mb={32}>
        <Text size="32px" fw={700} c="dark">
          Best Sellers
        </Text>
        <Text
          component="a"
          href="#products"
          size="sm"
          c="slate"
          style={{ textDecoration: "none", cursor: "pointer" }}
        >
          View All
        </Text>
      </Group>

      <SimpleGrid cols={{ base: 1, xs: 2, sm: 2, lg: 4 }} spacing="lg">
        {bestSellers.map((product) => (
          <ProductCard
            key={product?.id}
            product={product}
            onQuickView={handleQuickView}
          />
        ))}
      </SimpleGrid>
    </Container>
  );
};

export default BestSellers;