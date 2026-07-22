import { Container, Title, Text, Button, Group, rem, Box } from "@mantine/core";
import siteContent from "../../data/siteContent";

const HeroSection = () => {
  const handleScrollToProducts = () => {
    const productsSection = document.getElementById("products");
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleScrollToNewArrivals = () => {
    const productsSection = document.getElementById("products");
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <Box
      id="home"
      style={{
        minHeight: "100vh",
        backgroundImage:
          "linear-gradient(rgba(30, 41, 59, 0.7), rgba(30, 41, 59, 0.7)), url(https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1600&q=80)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center"
      }}
    >
      <Container size="lg" py={80}>
        <div style={{ maxWidth: rem(540) }}>
          <Title
            order={1}
            size="3.5rem"
            fw={800}
            lh={1.1}
            c="white"
            mb="lg"
          >
            {siteContent.hero.headline}
          </Title>
          <Text size="xl" c="slate.1" mb="xl" maw={rem(480)}>
            {siteContent.hero.subheadline}
          </Text>
          <Group gap="md">
            <Button
              size="lg"
              radius="md"
              color="gold"
              onClick={handleScrollToProducts}
            >
              {siteContent.hero.primaryCta}
            </Button>
            <Button
              size="lg"
              radius="md"
              variant="outline"
              color="white"
              onClick={handleScrollToNewArrivals}
            >
              {siteContent.hero.secondaryCta}
            </Button>
          </Group>
        </div>
      </Container>
    </Box>
  );
};

export default HeroSection;