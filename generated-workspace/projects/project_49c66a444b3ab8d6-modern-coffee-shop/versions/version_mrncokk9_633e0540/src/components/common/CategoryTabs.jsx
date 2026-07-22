import { Tabs } from "@mantine/core";

const CategoryTabs = ({ categories, activeCategory, onChange }) => {
  return (
    <Tabs
      value={activeCategory}
      onChange={onChange}
      variant="default"
      color="coffeeBrown"
      style={{ width: "100%" }}
    >
      <Tabs.List grow>
        {categories.map((category) => (
          <Tabs.Tab
            key={category.id}
            value={category.id}
            style={{
              fontWeight: 500,
              color: "var(--mantine-color-coffeeBrown-7)"
            }}
          >
            {category.label}
          </Tabs.Tab>
        ))}
      </Tabs.List>
    </Tabs>
  );
};

export default CategoryTabs;