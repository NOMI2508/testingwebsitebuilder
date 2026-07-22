import { Container, Grid, Group, Text, Image, rem, Paper } from "@mantine/core";
import siteContent from "../../data/siteContent";

const BrandStory = () => {
  const brandStory = siteContent?.brandStory || {};
  const brand = siteContent?.brand || {};

  return (
    <Container size="lg" py={64} id="brand-story">
      <Paper p={0} radius="md" shadow="sm">
        <Grid gutter={0} align="center">
          <Grid.Col span={{ base: 12, md: 6 }}>
            <div style={{ padding: rem(48) }}>
              <Text size="14px" tt="uppercase" fw={600} c="gold" mb="xs">
                Our Craftsmanship
              </Text>
              <Text size="32px" fw={700} c="dark" mb="md" lh={1.2}>
                {brandStory?.title || "Our Story"}
              </Text>
              <Text size="md" c="dimmed" mb="lg" lh={1.6}>
                {brandStory?.content || "Premium footwear crafted with meticulous attention to detail."}
              </Text>
              <Text size="md" c="dimmed" mb="xl" lh={1.6}>
                {brandStory?.craftsmanship || "Each pair represents our commitment to quality and style."}
              </Text>
              <Group>
                <Text fw={600} c="dark">
                  {brandStory?.founder || "The Stride Team"}
                </Text>
              </Group>
            </div>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <div style={{ position: "relative", height: rem(400), overflow: "hidden" }}>
              <img
                src="https://images.unsplash.com/photo-1526170304741-3e4c5c4c4c4c?w=800&q=80"
                alt="Craftsmanship"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover"
                }}
                onError={(e) => {
                  e.target.src = "https://placehold.co/800x400?text=Craftsmanship";
                }}
              />
            </div>
          </Grid.Col>
        </Grid>
      </Paper>
    </Container>
  );
};

export default BrandStory;