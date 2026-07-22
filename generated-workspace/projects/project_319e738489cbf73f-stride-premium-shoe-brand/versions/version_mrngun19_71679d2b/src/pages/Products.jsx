import { Container, Title, Text, rem } from "@mantine/core";
import { useState, useEffect } from "react";
import ProductFilters from "../components/sections/ProductFilters";
import ProductGrid from "../components/sections/ProductGrid";

const Products = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 300]);
  const [sortBy, setSortBy] = useState("featured");

  useEffect(() => {
    const handleFilterCategory = (event) => {
      const category = event.detail;
      if (category) {
        setSelectedCategory(category);
      }
    };

    const handleClearFilters = () => {
      setSearchQuery("");
      setSelectedCategory("all");
      setPriceRange([0, 300]);
      setSortBy("featured");
    };

    window.addEventListener("filterCategory", handleFilterCategory);
    window.addEventListener("clearFilters", handleClearFilters);

    return () => {
      window.removeEventListener("filterCategory", handleFilterCategory);
      window.removeEventListener("clearFilters", handleClearFilters);
    };
  }, []);

  return (
    <Container size="lg" py={48}>
      <div style={{ textAlign: "center", marginBottom: rem(32) }}>
        <Title order={2} size="2.5rem" fw={700} c="dark" mb="xs">
          Our Collection
        </Title>
        <Text size="lg" c="dimmed" maw={600} mx="auto">
          Discover premium footwear designed for every stride in your journey
        </Text>
      </div>
      
      <ProductFilters
        onSearch={setSearchQuery}
        onCategoryChange={setSelectedCategory}
        onPriceChange={setPriceRange}
        onSortChange={setSortBy}
      />
      
      <ProductGrid
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
        priceRange={priceRange}
        sortBy={sortBy}
      />
    </Container>
  );
};

export default Products;