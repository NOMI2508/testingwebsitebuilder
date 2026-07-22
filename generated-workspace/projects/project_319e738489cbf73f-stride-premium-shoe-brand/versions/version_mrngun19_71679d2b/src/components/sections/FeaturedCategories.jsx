import { Container, SimpleGrid, Card, Text, Group, Badge, rem } from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";
import mockProducts from "../../data/mockProducts";
import siteContent from "../../data/siteContent";

const FeaturedCategories = () => {
  const categories = siteContent?.categories || [];
  const products = Array.isArray(mockProducts) ? mockProducts : [];

  const getCategoryImage = (categoryId) => {
    const categoryProducts = products.filter((p) => p?.category === categoryId);
    return categoryProducts?.[0]?.images?.[0] || "https://placehold.co/400x300?text=Category";
  };

  const getProductCount = (categoryId) => {
    return products.filter((p) => p?.category === categoryId).length;
  };

  const handleCategoryClick = (categoryId) => {
    const element = document.getElementById("products");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      // Dispatch custom event for filtering
      window.dispatchEvent(new CustomEvent("filterCategory", { detail: categoryId }));
    }
  };

  const categoryImages = {
    sneakers: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80",
    boots: "https://images.unsplash.com/photo-1608231388708-40e76e2a1d23?w=600&q=80",
    athletic: "https://images.unsplash.com/photo-1595950291288-7a2b3b3b3b3b?w=600&q=80",
    casual: "https://images.unsplash.com/photo-1614259056978-7c4c5b7b7b7b?w=600&q=80"
  };

  return (
    <Container size="lg" py={64}>
      <Group justify="space-between" mb={32}>
        <Text size="32px" fw={700} c="dark">
          Shop by Category
        </Text>
      </Group>

      <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }} spacing="lg">
        {categories.map((category) => (
          <Card
            key={category?.id}
            shadow="sm"
            padding={0}
            radius="md"
            style={{
              cursor: "pointer",
              transition: "transform 150ms ease, box-shadow 150ms ease",
              overflow: "hidden"
            }}
            className="category-card"
            onClick={() => handleCategoryClick(category?.id)}
          >
            <Card.Section>
              <div style={{ position: "relative", height: rem(180), overflow: "hidden" }}>
                <img
                  src={categoryImages[category?.id] || getCategoryImage(category?.id)}
                  alt={category?.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: "transform 300ms ease"
                  }}
                  onError={(e) => {
                    e.target.src = "https://placehold.co/400x300?text=Category";
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
                    padding: rem(16),
                    paddingTop: rem(32)
                  }}
                >
                  <Group justify="space-between" align="center">
                    <Text fw={600} size="lg" c="white">
                      {category?.name}
                    </Text>
                    <Badge color="gold" variant="filled" size="sm">
                      {getProductCount(category?.id)} items
                    </Badge>
                  </Group>
                </div>
              </div>
            </Card.Section>
          </Card>
        ))}
      </SimpleGrid>
    </Container>
  );
};

export default FeaturedCategories;