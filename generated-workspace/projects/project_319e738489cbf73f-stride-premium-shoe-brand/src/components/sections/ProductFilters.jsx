import { Container, Group, TextInput, Select, Slider, Text, rem, Box } from "@mantine/core";
import { IconSearch, IconX } from "@tabler/icons-react";
import { useDisclosure, useInputState, useState } from "@mantine/hooks";
import siteContent from "../../data/siteContent";

const ProductFilters = ({ onSearch, onCategoryChange, onPriceChange, onSortChange }) => {
  const categories = siteContent?.categories || [];
  const [searchValue, setSearchValue] = useInputState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 300]);
  const [sortBy, setSortBy] = useState("featured");

  const categoryOptions = [
    { value: "all", label: "All Categories" },
    ...categories.map((cat) => ({
      value: cat?.id || "",
      label: cat?.name || ""
    }))
  ];

  const sortOptions = [
    { value: "featured", label: "Featured" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "newest", label: "Newest" },
    { value: "popular", label: "Most Popular" }
  ];

  const handleSearchChange = (value) => {
    setSearchValue(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleCategoryChangeLocal = (value) => {
    setSelectedCategory(value);
    if (onCategoryChange) {
      onCategoryChange(value);
    }
  };

  const handlePriceChangeLocal = (value) => {
    setPriceRange(value);
    if (onPriceChange) {
      onPriceChange(value);
    }
  };

  const handleSortChangeLocal = (value) => {
    setSortBy(value);
    if (onSortChange) {
      onSortChange(value);
    }
  };

  const clearSearch = () => {
    setSearchValue("");
    if (onSearch) {
      onSearch("");
    }
  };

  return (
    <Container size="lg" py={24} id="filters">
      <Group justify="space-between" mb="lg" wrap="wrap">
        <TextInput
          placeholder="Search shoes..."
          value={searchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          leftSection={<IconSearch size={rem(18)} />}
          rightSection={
            searchValue ? (
              <Box
                component="button"
                type="button"
                onClick={clearSearch}
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  padding: 0
                }}
              >
                <IconX size={rem(16)} />
              </Box>
            ) : null
          }
          style={{ flex: 1, minWidth: rem(200), maxWidth: rem(300) }}
        />

        <Group gap="sm" wrap="wrap">
          <Select
            data={categoryOptions}
            value={selectedCategory}
            onChange={handleCategoryChangeLocal}
            placeholder="Category"
            clearable={false}
            style={{ minWidth: rem(150) }}
          />

          <Select
            data={sortOptions}
            value={sortBy}
            onChange={handleSortChangeLocal}
            placeholder="Sort by"
            clearable={false}
            style={{ minWidth: rem(150) }}
          />
        </Group>
      </Group>

      <Group mb="xl">
        <Text size="sm" fw={500} c="dimmed" mr="xs">
          Price Range:
        </Text>
        <Slider
          min={0}
          max={300}
          step={10}
          value={priceRange}
          onChange={handlePriceChangeLocal}
          label={(value) => `$${value[0]} - $${value[1]}`}
          style={{ flex: 1, maxWidth: rem(400) }}
        />
      </Group>
    </Container>
  );
};

export default ProductFilters;