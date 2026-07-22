import { Container, Title, Text, Button, Group, Card, rem, Box, Center, ThemeIcon } from "@mantine/core";
import { IconCheck, IconShoppingBag, IconHome } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import StoreLayout from "../components/layout/StoreLayout";

const OrderConfirmationPage = () => {
  return (
    <Container size="md" px="md" py="xl">
      <Card shadow="sm" padding="xl" radius="lg" ta="center">
        <Center mb="lg">
          <ThemeIcon size={80} radius={100} color="success">
            <IconCheck size={rem(40)} stroke={2} />
          </ThemeIcon>
        </Center>

        <Title order={1} mb="md" c="success.7">
          Order Placed Successfully!
        </Title>

        <Text size="lg" c="dimmed" mb="lg">
          Thank you for your purchase. Your order has been received and is being processed.
          You will receive a confirmation email shortly with your order details.
        </Text>

        <Text size="md" mb="xl">
          Order Number: <Text span weight={600}>#{Math.floor(100000 + Math.random() * 900000)}</Text>
        </Text>

        <Group spacing="md" justify="center">
          <Button
            component={Link}
            to="/"
            leftIcon={<IconHome size={rem(18)} />}
            variant="light"
            color="brand"
            size="md"
          >
            Continue Shopping
          </Button>
          <Button
            component={Link}
            to="/"
            leftIcon={<IconShoppingBag size={rem(18)} />}
            variant="outline"
            color="gray"
            size="md"
          >
            View Products
          </Button>
        </Group>
      </Card>
    </Container>
  );
};

export default OrderConfirmationPage;