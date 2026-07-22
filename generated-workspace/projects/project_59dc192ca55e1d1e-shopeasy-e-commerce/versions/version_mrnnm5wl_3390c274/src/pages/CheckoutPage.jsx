import { Container, Title, Text, Button, Group, Card, rem, Box } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import StoreLayout from "../components/layout/StoreLayout";
import CheckoutForm from "../components/cart/CheckoutForm";

const CheckoutPage = () => {
  return (
    <Container size="xl" px="md" py="xl">
      <Box mb="lg">
        <Group spacing="sm">
          <Button
            component={Link}
            to="/"
            variant="subtle"
            color="gray"
            leftIcon={<IconArrowLeft size={rem(16)} />}
            size="sm"
          >
            Back to Shop
          </Button>
        </Group>
      </Box>

      <Title order={1} mb="lg">
        Checkout
      </Title>

      <CheckoutForm />
    </Container>
  );
};

export default CheckoutPage;