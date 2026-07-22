import { Group, Box, Button, Drawer, rem, useMantineTheme } from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { IconFilter } from "@tabler/icons-react";
import FilterPanel from "../common/FilterPanel";

const FilterBarSection = ({
  categories,
  selectedCategory,
  onCategoryChange,
  priceRange,
  onPriceChange,
  onClearFilters,
}) => {
  const [opened, { open, close }] = useDisclosure(false);
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  const filterContent = (
    <FilterPanel
      categories={categories}
      selectedCategory={selectedCategory}
      onCategoryChange={onCategoryChange}
      priceRange={priceRange}
      onPriceChange={onPriceChange}
      onClearFilters={onClearFilters}
    />
  );

  if (isMobile) {
    return (
      <>
        <Box
          style={{
            position: "sticky",
            top: rem(60),
            backgroundColor: "var(--mantine-color-body)",
            zIndex: 10,
            padding: `${rem(12)} ${rem(16)}`,
            borderBottom: "1px solid var(--mantine-color-gray-3)",
          }}
        >
          <Group position="apart">
            <Button
              leftIcon={<IconFilter size={16} />}
              variant="light"
              color="gray"
              size="sm"
              onClick={open}
            >
              Filters
            </Button>
            {selectedCategory && selectedCategory !== "All" && (
              <Button
                variant="subtle"
                color="gray"
                size="sm"
                onClick={onClearFilters}
              >
                Clear
              </Button>
            )}
          </Group>
        </Box>

        <Drawer
          opened={opened}
          onClose={close}
          title="Filter Products"
          padding="md"
          size="sm"
          position="right"
        >
          {filterContent}
        </Drawer>
      </>
    );
  }

  return (
    <Box
      style={{
        padding: `${rem(16)} 0`,
        borderBottom: "1px solid var(--mantine-color-gray-3)",
      }}
    >
      <Group position="left" spacing="lg" align="flex-end">
        {filterContent}
      </Group>
    </Box>
  );
};

export default FilterBarSection;