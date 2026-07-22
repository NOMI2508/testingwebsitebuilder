import { Drawer, Group, Text, Button, Divider, Box, ScrollArea, rem, Center } from "@mantine/core";
import { IconShoppingCart, IconX, IconArrowRight } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import formatPrice from "../../lib/formatPrice";
import CartItem from "./CartItem";

const CartDrawer = ({ opened, onClose }) => {
  const navigate = useNavigate();
  const { cartItems, getCartTotal, getCartItemCount, clearCart } = useCart();

  const safeCartItems = Array.isArray(cartItems) ? cartItems : [];
  const itemCount = getCartItemCount ? getCartItemCount() : 0;
  const total = getCartTotal ? getCartTotal() : 0;

  const handleCheckout = () => {
    if (onClose) {
      onClose();
    }
    navigate("/checkout");
  };

  const handleContinueShopping = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={
        <Group spacing="xs">
          <IconShoppingCart size={rem(20)} />
          <Text weight={600} size="lg">
            Shopping Cart ({itemCount})
          </Text>
        </Group>
      }
      padding="md"
      size="md"
      position="right"
      closeButtonProps={{
        icon: <IconX size={rem(20)} />,
        "aria-label": "Close cart",
      }}
    >
      <Box style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        {safeCartItems.length === 0 ? (
          <Center style={{ flex: 1 }}>
            <Text color="dimmed" align="center">
              Your cart is empty. Add some products to get started!
            </Text>
          </Center>
        ) : (
          <>
            <ScrollArea style={{ flex: 1 }} pr="xs">
              {safeCartItems.map((item) => (
                <CartItem key={item.productId} item={item} />
              ))}
            </ScrollArea>

            <Box mt="md">
              <Divider my="sm" />
              <Group position="apart" mb="lg">
                <Text weight={500} size="lg">
                  Subtotal
                </Text>
                <Text weight={700} size="xl" color="success.6">
                  {formatPrice(total)}
                </Text>
              </Group>

              <Group spacing="sm">
                <Button
                  variant="light"
                  color="gray"
                  onClick={handleContinueShopping}
                  fullWidth
                >
                  Continue Shopping
                </Button>
                <Button
                  rightIcon={<IconArrowRight size={rem(16)} />}
                  onClick={handleCheckout}
                  fullWidth
                >
                  Checkout
                </Button>
              </Group>
            </Box>
          </>
        )}
      </Box>
    </Drawer>
  );
};

export default CartDrawer;