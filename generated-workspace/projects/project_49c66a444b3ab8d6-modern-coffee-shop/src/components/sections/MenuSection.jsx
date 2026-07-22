import { Container, Title, SimpleGrid, Box } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import siteContent from "../../data/siteContent";
import CategoryTabs from "../common/CategoryTabs";
import CoffeeCard from "../common/CoffeeCard";
import Lightbox from "../common/Lightbox";

const MenuSection = () => {
  const [activeCategory, setActiveCategory] = useDisclosure(siteContent.menu.categories[0].id);
  const [lightboxCoffee, setLightboxCoffee] = useDisclosure(null);
  const [lightboxOpened, lightboxHandlers] = useDisclosure(false);

  const filteredItems = siteContent.menu.items.filter(
    (item) => item.category === activeCategory
  );

  const handleCoffeeClick = (coffee) => {
    setLightboxCoffee(coffee);
    lightboxHandlers.open();
  };

  return (
    <Box
      id="menu"
      style={{
        backgroundColor: "var(--mantine-color-cream-1)",
        padding: "4rem 0"
      }}
    >
      <Container size="lg">
        <Title
          order={2}
          align="center"
          mb="xl"
          color="coffeeBrown.7"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Our Coffee Menu
        </Title>

        <Box mb="xl">
          <CategoryTabs
            categories={siteContent.menu.categories}
            activeCategory={activeCategory}
            onChange={setActiveCategory}
          />
        </Box>

        <SimpleGrid
          cols={3}
          spacing="lg"
          breakpoints={[
            { maxWidth: "62rem", cols: 2 },
            { maxWidth: "48rem", cols: 1 }
          ]}
        >
          {filteredItems.map((coffee) => (
            <CoffeeCard
              key={coffee.id}
              coffee={coffee}
              onClick={handleCoffeeClick}
            />
          ))}
        </SimpleGrid>
      </Container>

      <Lightbox
        coffee={lightboxCoffee}
        opened={lightboxOpened}
        onClose={lightboxHandlers.close}
      />
    </Box>
  );
};

export default MenuSection;