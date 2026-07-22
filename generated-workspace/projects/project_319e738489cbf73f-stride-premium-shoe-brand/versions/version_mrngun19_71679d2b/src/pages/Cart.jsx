import { Container, Title, Text, Grid, Stack, Center, rem } from "@mantine/core";
import { useCart } from "../context/CartContext";
import CartItem from "../components/cart/CartItem";
import CartSummary from "../components/cart/CartSummary";
import EmptyState from "../components/common/EmptyState";

const Cart = () => {
  const { cartItems, updateQuantity, removeItem, getCartTotal } = useCart();
  const safeCartItems = Array.isArray(cartItems) ? cartItems : [];
  const cartTotal = getCartTotal();

  const handleUpdateQuantity = (itemId, newQuantity) => {
    updateQuantity(itemId, newQuantity);
  };

  const handleRemove = (itemId) => {
    removeItem(itemId);
  };

  const handleCheckout = () => {
    window.location.hash = "#checkout";
  };

  if (safeCartItems.length === 0) {
    return (
      <Container size="lg" py={80}>
        <EmptyState
          type="cart"
          title="Your cart is empty"
          description="Browse our collection and add your favorite shoes to the cart."
          actionLabel="Shop Collection"
          onAction={() => { window.location.hash = "#products"; }}
        />
      </Container>
    );
  }

  return (
    <Container size="lg" py={48}>
      <Title order={2} size="2rem" fw={700} c="dark" mb="xl">
        Shopping Cart
      </Title>
      
      <Grid gutter={{ base: "md", lg: 48 }}>
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Stack gap="md">
            {safeCartItems.map((item) => (
              <CartItem
                key={item?.id}
                item={item}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemove}
              />
            ))}
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <CartSummary
            cartTotal={cartTotal}
            onCheckout={handleCheckout}
          />
        </Grid.Col>
      </Grid>
    </Container>
  );
};

export default Cart;