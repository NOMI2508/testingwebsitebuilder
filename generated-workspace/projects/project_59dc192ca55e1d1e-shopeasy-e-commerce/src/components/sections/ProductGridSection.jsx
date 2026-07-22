import { SimpleGrid, Text, Center, Box, Alert } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import ProductCard from "../common/ProductCard";

const ProductGridSection = ({ products, loading = false }) => {
  const safeProducts = Array.isArray(products) ? products : [];

  if (loading) {
    return (
      <SimpleGrid cols={4} spacing="lg" breakpoints={[
        { minWidth: "sm", cols: 2 },
        { minWidth: "md", cols: 3 },
        { minWidth: "lg", cols: 4 },
      ]}>
        {Array.from({ length: 8 }).map((_, index) => (
          <ProductCard key={index} loading={true} />
        ))}
      </SimpleGrid>
    );
  }

  if (safeProducts.length === 0) {
    return (
      <Center style={{ minHeight: 300 }}>
        <Alert
          icon={<IconInfoCircle size={20} />}
          title="No products found"
          color="gray"
          variant="light"
        >
          Try adjusting your search or filter criteria to find what you're looking for.
        </Alert>
      </Center>
    );
  }

  return (
    <Box pt="lg">
      <SimpleGrid
        cols={1}
        spacing="lg"
        breakpoints={[
          { minWidth: "sm", cols: 2 },
          { minWidth: "md", cols: 3 },
          { minWidth: "lg", cols: 4 },
        ]}
      >
        {safeProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default ProductGridSection;