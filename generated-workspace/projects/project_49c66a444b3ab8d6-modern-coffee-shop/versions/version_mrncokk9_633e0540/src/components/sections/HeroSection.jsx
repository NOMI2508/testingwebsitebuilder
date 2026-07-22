import { Box, Title, Text, Button, Group, Container } from "@mantine/core";
import siteContent from "../../data/siteContent";

const HeroSection = () => {
  const { hero } = siteContent;

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <Box
      component="section"
      id="hero"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: "url('https://images.unsplash.com/photo-1504754524783-8d2a6c2b61b9?w=1200&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative"
      }}
    >
      <Box
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(101, 67, 33, 0.7)"
        }}
      />
      
      <Container
        size="lg"
        style={{
          position: "relative",
          zIndex: 1,
          textAlign: "center"
        }}
      >
        <Title
          order={1}
          size={48}
          weight={700}
          color="cream.0"
          style={{
            marginBottom: "var(--mantine-spacing-md)",
            fontFamily: "Georgia, serif"
          }}
        >
          {hero.headline}
        </Title>
        
        <Text
          size="xl"
          color="cream.2"
          style={{
            marginBottom: "var(--mantine-spacing-xl)",
            maxWidth: "600px",
            marginLeft: "auto",
            marginRight: "auto"
          }}
        >
          {hero.subheadline}
        </Text>
        
        <Group position="center" spacing="lg">
          <Button
            size="lg"
            variant="filled"
            onClick={() => scrollToSection("menu")}
          >
            {hero.ctaPrimary}
          </Button>
          <Button
            size="lg"
            variant="outline"
            color="cream"
            onClick={() => scrollToSection("contact")}
          >
            {hero.ctaSecondary}
          </Button>
        </Group>
      </Container>
    </Box>
  );
};

export default HeroSection;