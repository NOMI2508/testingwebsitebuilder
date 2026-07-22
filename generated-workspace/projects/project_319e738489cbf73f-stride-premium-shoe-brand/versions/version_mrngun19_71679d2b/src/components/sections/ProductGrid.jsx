import { SimpleGrid, Text, Group, rem } from "@mantine/core";
import { useState, useEffect } from "react";
import ProductCard from "../common/ProductCard";
import LoadingSkeleton from "../common/LoadingSkeleton";
import EmptyState from "../common/EmptyState";
import mockProducts from "../../data/mockProducts";

const ProductGrid = ({ 
  searchQuery = "", 
  selectedCategory = "all", 
  priceRange = [0, 300], 
  sortBy = "featured",
  onQuickView,
  onAddToCart 
}) => {
  const [loading, setLoading] = useState(true);
  const [filteredProducts, setFilteredProducts] = useState([]);

  const products = Array.isArray(mockProducts) ? mockProducts : [];

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      let result = [...products];

      // Search filter
      if (searchQuery && typeof searchQuery === "string") {
        const query = searchQuery.toLowerCase();
        result = result.filter((product) => {
          const name = product?.name || "";
          const description = product?.description || "";
          return name.toLowerCase().includes(query) || description.toLowerCase().includes(query);
        });
      }

      // Category filter
      if (selectedCategory && selectedCategory !== "all") {
        result = result.filter((product) => product?.category === selectedCategory);
      }

      // Price range filter
      if (Array.isArray(priceRange) && priceRange.length === 2) {
        const minPrice = priceRange[0] || 0;
        const maxPrice = priceRange[1] || 300;
        result = result.filter((product) => {
          const productPrice = product?.salePrice || product?.price || 0;
          return productPrice >= minPrice && productPrice <= maxPrice;
        });
      }

      // Sort
      if (sortBy && typeof sortBy === "string") {
        switch (sortBy) {
          case "price-low":
            result.sort((a, b) => (a?.salePrice || a?.price || 0) - (b?.salePrice || b?.price || 0));
            break;
          case "price-high":
            result.sort((a, b) => (b?.salePrice || b?.price || 0) - (a?.salePrice || a?.price || 0));
            break;
          case "newest":
            result.sort((a, b) => (b?.id || 0) - (a?.id || 0));
            break;
          case "popular":
            result.sort((a, b) => (b?.reviewCount || 0) - (a?.reviewCount || 0));
            break;
          case "featured":
          default:
            // Keep original order
            break;
        }
      }

      setFilteredProducts(result);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, priceRange, sortBy, products]);

  const handleQuickView = (product) => {
    if (onQuickView) {
      onQuickView(product);
    }
  };

  const handleAddToCart = (product) => {
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  const handleClearFilters = () => {
    window.dispatchEvent(new CustomEvent("clearFilters"));
  };

  if (loading) {
    return <LoadingSkeleton count={8} height={320} />;
  }

  if (filteredProducts.length === 0) {
    return (
      <EmptyState
        type="search"
        title="No products found"
        description="Try adjusting your search or filter criteria to find what you're looking for."
        actionLabel="Clear Filters"
        onAction={handleClearFilters}
      />
    );
  }

  return (
    <div id="products">
      <Group justify="space-between" mb="lg" px="lg">
        <Text size="sm" c="dimmed">
          Showing {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}
        </Text>
      </Group>
      <SimpleGrid cols={{ base: 1, xs: 2, sm: 2, lg: 4 }} spacing="lg" px="lg" pb="xl">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product?.id}
            product={product}
            onQuickView={handleQuickView}
            onAddToCart={handleAddToCart}
          />
        ))}
      </SimpleGrid>
    </div>
  );
};

export default ProductGrid;