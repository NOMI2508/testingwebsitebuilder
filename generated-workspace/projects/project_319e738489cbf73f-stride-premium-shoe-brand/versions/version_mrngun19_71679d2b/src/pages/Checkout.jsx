import { Container, Grid, Stack, TextInput, Select, Radio, Group, Button, Paper, Text, Divider, rem, Alert } from "@mantine/core";
import { IconCheck, IconCreditCard, IconCash } from "@tabler/icons-react";
import { useState } from "react";
import { useCart } from "../context/CartContext";
import CartSummary from "../components/cart/CartSummary";
import formatPrice from "../lib/formatPrice";

const Checkout = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "US"
  });

  const safeCartItems = Array.isArray(cartItems) ? cartItems : [];
  const cartTotal = getCartTotal();

  const handleInputChange = (field) => (event) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSelectChange = (field) => (value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    const requiredFields = ["firstName", "lastName", "email", "address", "city", "state", "zip", "country"];
    return requiredFields.every((field) => formData[field]?.trim() !== "");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (validateForm()) {
      setIsSubmitted(true);
      clearCart();
    }
  };

  const countryOptions = [
    { value: "US", label: "United States" },
    { value: "CA", label: "Canada" },
    { value: "UK", label: "United Kingdom" },
    { value: "AU", label: "Australia" },
    { value: "DE", label: "Germany" }
  ];

  if (isSubmitted) {
    return (
      <Container size="lg" py={64}>
        <Stack align="center" gap="lg">
          <Alert
            icon={<IconCheck size={rem(24)} />}
            title="Order Placed Successfully!"
            color="green"
            radius="md"
            style={{ maxWidth: rem(500), width: "100%" }}
          >
            <Text size="sm" mt="xs">
              Thank you for your purchase. Your order confirmation has been sent to {formData.email}.
              We'll notify you when your items ship.
            </Text>
          </Alert>
          <Button
            size="md"
            radius="md"
            onClick={() => setIsSubmitted(false)}
            style={{ width: rem(200) }}
          >
            Continue Shopping
          </Button>
        </Stack>
      </Container>
    );
  }

  return (
    <Container size="lg" py={48}>
      <Text size="xl" fw={700} mb="lg">
        Checkout
      </Text>

      <Grid gutter="xl">
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Paper padding="lg" radius="md" shadow="sm">
            <form onSubmit={handleSubmit}>
              <Stack gap="lg">
                <div>
                  <Text size="md" fw={600} mb="md">
                    Shipping Information
                  </Text>
                  <Grid gutter="md">
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <TextInput
                        label="First Name"
                        placeholder="John"
                        required
                        value={formData.firstName}
                        onChange={handleInputChange("firstName")}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <TextInput
                        label="Last Name"
                        placeholder="Doe"
                        required
                        value={formData.lastName}
                        onChange={handleInputChange("lastName")}
                      />
                    </Grid.Col>
                    <Grid.Col span={12}>
                      <TextInput
                        label="Email"
                        placeholder="john@example.com"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange("email")}
                      />
                    </Grid.Col>
                    <Grid.Col span={12}>
                      <TextInput
                        label="Phone"
                        placeholder="+1 (555) 123-4567"
                        value={formData.phone}
                        onChange={handleInputChange("phone")}
                      />
                    </Grid.Col>
                    <Grid.Col span={12}>
                      <TextInput
                        label="Address"
                        placeholder="123 Main Street"
                        required
                        value={formData.address}
                        onChange={handleInputChange("address")}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <TextInput
                        label="City"
                        placeholder="New York"
                        required
                        value={formData.city}
                        onChange={handleInputChange("city")}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <TextInput
                        label="State"
                        placeholder="NY"
                        required
                        value={formData.state}
                        onChange={handleInputChange("state")}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <TextInput
                        label="ZIP Code"
                        placeholder="10001"
                        required
                        value={formData.zip}
                        onChange={handleInputChange("zip")}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <Select
                        label="Country"
                        data={countryOptions}
                        value={formData.country}
                        onChange={handleSelectChange("country")}
                        required
                      />
                    </Grid.Col>
                  </Grid>
                </div>

                <Divider />

                <div>
                  <Text size="md" fw={600} mb="md">
                    Payment Method
                  </Text>
                  <Radio.Group
                    value={paymentMethod}
                    onChange={setPaymentMethod}
                    name="paymentMethod"
                  >
                    <Stack gap="sm">
                      <Radio
                        value="card"
                        label={
                          <Group gap="xs">
                            <IconCreditCard size={rem(20)} />
                            <Text>Credit Card</Text>
                          </Group>
                        }
                      />
                      <Radio
                        value="paypal"
                        label={
                          <Group gap="xs">
                            <IconCreditCard size={rem(20)} />
                            <Text>PayPal</Text>
                          </Group>
                        }
                      />
                      <Radio
                        value="cod"
                        label={
                          <Group gap="xs">
                            <IconCash size={rem(20)} />
                            <Text>Cash on Delivery</Text>
                          </Group>
                        }
                      />
                    </Stack>
                  </Radio.Group>
                </div>

                <Button
                  type="submit"
                  size="md"
                  radius="md"
                  style={{ width: "100%" }}
                >
                  Place Order
                </Button>
              </Stack>
            </form>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 5 }}>
          <Stack gap="md">
            <Text size="md" fw={600}>
              Order Summary
            </Text>
            <CartSummary cartTotal={cartTotal} />
          </Stack>
        </Grid.Col>
      </Grid>
    </Container>
  );
};

export default Checkout;