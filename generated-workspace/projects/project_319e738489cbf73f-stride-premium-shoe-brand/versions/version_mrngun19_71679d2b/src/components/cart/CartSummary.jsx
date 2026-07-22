import { Stack, Group, Text, Button, Paper, Divider, rem } from "@mantine/core";
import formatPrice from "../../lib/formatPrice";

const CartSummary = ({ cartTotal = 0, onCheckout }) => {
  const safeCartTotal = typeof cartTotal === "number" ? cartTotal : 0;
  
  const shippingThreshold = 150;
  const shippingCost = safeCartTotal >= shippingThreshold ? 0 : 15;
  const taxRate = 0.08;
  const tax = safeCartTotal * taxRate;
  const orderTotal = safeCartTotal + shippingCost + tax;

  return (
    <Paper padding="lg" radius="md" shadow="sm">
      <Stack gap="md">
        <Text size="lg" fw={600}>
          Order Summary
        </Text>

        <Group justify="space-between">
          <Text c="dimmed">Subtotal</Text>
          <Text fw={500}>{formatPrice(safeCartTotal)}</Text>
        </Group>

        <Group justify="space-between">
          <Text c="dimmed">Shipping</Text>
          <Text fw={500}>
            {shippingCost === 0 ? "Free" : formatPrice(shippingCost)}
          </Text>
        </Group>

        <Group justify="space-between">
          <Text c="dimmed">Estimated Tax</Text>
          <Text fw={500}>{formatPrice(tax)}</Text>
        </Group>

        <Divider />

        <Group justify="space-between">
          <Text size="lg" fw={700}>
            Total
          </Text>
          <Text size="lg" fw={700} c="gold">
            {formatPrice(orderTotal)}
          </Text>
        </Group>

        {safeCartTotal < shippingThreshold && (
          <Text size="xs" c="dimmed" ta="center">
            Add {formatPrice(shippingThreshold - safeCartTotal)} more for free shipping
          </Text>
        )}

        <Button
          size="md"
          radius="md"
          onClick={onCheckout}
          disabled={safeCartTotal === 0}
          style={{ width: "100%" }}
        >
          Proceed to Checkout
        </Button>
      </Stack>
    </Paper>
  );
};

export default CartSummary;