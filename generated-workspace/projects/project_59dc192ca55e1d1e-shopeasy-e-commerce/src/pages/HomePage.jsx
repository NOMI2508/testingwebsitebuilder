import { Container, Box, rem } from "@mantine/core";
import { useState, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import StoreLayout from "../components/layout/StoreLayout";
import FilterBarSection from "../components/sections/FilterBarSection";
import ProductGridSection from "../components/sections/ProductGridSection";
import { products, categories } from "../data/products";

const HomePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "All"
  );
  const [priceRange, setPriceRange] = useState([0, 300]);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Apply category filter
    if (selectedCategory && selectedCategory !== "All") {
      result = result.filter((product) => product.category === selectedCategory);
    }

    // Apply price filter
    result = result.filter(
      (product) => product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // Apply search filter
    if (searchQuery && searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query)
      );
    }

    return result;
  }, [selectedCategory, priceRange, searchQuery]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setSearchParams((prev) => {
      if (category && category !== "All") {
        prev.set("category", category);
      } else {
        prev.delete("category");
      }
      return prev;
    });
  };

  const handlePriceChange = (range) => {
    setPriceRange(range);
  };

  const handleClearFilters = () => {
    setSelectedCategory("All");
    setPriceRange([0, 300]);
    setSearchQuery("");
    setSearchParams({});
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  return (
    <Container size="xl" px="md">
      <Box pt="lg" pb="xl">
        <FilterBarSection
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
          priceRange={priceRange}
          onPriceChange={handlePriceChange}
          onClearFilters={handleClearFilters}
        />
        <ProductGridSection products={filteredProducts} />
      </Box>
    </Container>
  );
};

export default HomePage;