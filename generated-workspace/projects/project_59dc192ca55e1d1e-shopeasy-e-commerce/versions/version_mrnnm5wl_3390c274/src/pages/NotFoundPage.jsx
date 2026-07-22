import { Container, Title, Text, Button, Group, Card, rem, Box, Center, ThemeIcon } from "@mantine/core";
import { IconAlertCircle, IconHome, IconSearch } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import StoreLayout from "../components/layout/StoreLayout";

const NotFoundPage = () => {
  return (
    <Container size="md" px="md" py="xl">
      <Card shadow="sm" padding="xl" radius="lg" ta="center">
        <Center mb="lg">
          <ThemeIcon size={80} radius={100} color="error">
            <IconAlertCircle size={rem(40)} stroke={2} />
          </ThemeIcon>
        </Center>

        <Title order={1} mb="md">
          Page Not Found
        </Title>

        <Text size="lg" c="dimmed" mb="xl">
          The page you're looking for doesn't exist or may have been moved.
          Please check the URL or navigate back to our shop.
        </Text>

        <Group spacing="md" justify="center">
          <Button
            component={Link}
            to="/"
            leftIcon={<IconHome size={rem(18)} />}
            variant="filled"
            color="brand"
            size="md"
          >
            Go to Home
          </Button>
          <Button
            component={Link}
            to="/"
            leftIcon={<IconSearch size={rem(18)} />}
            variant="outline"
            color="gray"
            size="md"
          >
            Browse Products
          </Button>
        </Group>
      </Card>
    </Container>
  );
};

export default NotFoundPage;