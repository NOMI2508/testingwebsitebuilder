import { Group, Chip, Slider, Text, Box, Button, rem } from "@mantine/core";
import { useState } from "react";

const FilterPanel = ({ categories, selectedCategory, onCategoryChange, priceRange, onPriceChange, onClearFilters }) => {
  const [priceRangeValue, setPriceRangeValue] = useState(priceRange || [0, 300]);

  const handlePriceChange = (values) => {
    setPriceRangeValue(values);
    if (onPriceChange) {
      onPriceChange(values);
    }
  };

  const handleClear = () => {
    setPriceRangeValue([0, 300]);
    if (onClearFilters) {
      onClearFilters();
    }
  };

  const safeCategories = Array.isArray(categories) ? categories : [];

  return (
    <Box>
      <Box mb="md">
        <Text size="sm" weight={500} mb="xs" c="dimmed">
          Categories
        </Text>
        <Chip.Group
          value={selectedCategory}
          onChange={onCategoryChange}
          multiple={false}
        >
          <Group spacing="xs" position="apart">
            {safeCategories.map((category) => (
              <Chip
                key={category}
                value={category}
                variant="filled"
                size="sm"
                radius="sm"
              >
                {category}
              </Chip>
            ))}
          </Group>
        </Chip.Group>
      </Box>

      <Box mb="md">
        <Text size="sm" weight={500} mb="xs" c="dimmed">
          Price Range
        </Text>
        <Slider
          min={0}
          max={300}
          step={10}
          value={priceRangeValue}
          onChange={handlePriceChange}
          label={(value) => `$${value}`}
          styles={{
            track: { marginTop: rem(10) },
          }}
        />
        <Group position="apart" mt="xs">
          <Text size="xs" c="dimmed">
            ${priceRangeValue[0]}
          </Text>
          <Text size="xs" c="dimmed">
            ${priceRangeValue[1]}
          </Text>
        </Group>
      </Box>

      <Button
        variant="subtle"
        color="gray"
        size="sm"
        onClick={handleClear}
        fullWidth
        mt="sm"
      >
        Clear Filters
      </Button>
    </Box>
  );
};

export default FilterPanel;