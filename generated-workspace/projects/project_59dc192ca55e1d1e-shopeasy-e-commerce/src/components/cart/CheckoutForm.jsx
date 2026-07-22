import { TextInput, Textarea, Select, Group, Text, Button, Card, rem, Box, Alert, Divider } from "@mantine/core";
import { IconCreditCard, IconCash, IconCheck } from "@tabler/icons-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import formatPrice from "../../lib/formatPrice";
import { products } from "../../data/products";

const CheckoutForm = () => {
  const navigate = useNavigate();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const safeCartItems = Array.isArray(cartItems) ? cartItems : [];
  const total = getCartTotal ? getCartTotal() : 0;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "US",
    paymentMethod: "credit",
    cardNumber: "",
    cardExpiry: "",
    cardCvv: "",
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }
    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }
    if (!formData.state.trim()) {
      newErrors.state = "State is required";
    }
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = "ZIP code is required";
    }

    if (formData.paymentMethod === "credit") {
      if (!formData.cardNumber.trim()) {
        newErrors.cardNumber = "Card number is required";
      } else if (!/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ""))) {
        newErrors.cardNumber = "Invalid card number";
      }
      if (!formData.cardExpiry.trim()) {
        newErrors.cardExpiry = "Expiry date is required";
      }
      if (!formData.cardCvv.trim()) {
        newErrors.cardCvv = "CVV is required";
      } else if (!/^\d{3,4}$/.test(formData.cardCvv)) {
        newErrors.cardCvv = "Invalid CVV";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setSubmitting(true);
      // Simulate processing
      setTimeout(() => {
        setSubmitting(false);
        setSubmitted(true);
        if (clearCart) {
          clearCart();
        }
        navigate("/order-confirmation");
      }, 1000);
    }
  };

  const handleChange = (field) => (value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Group spacing="xl" align="flex-start">
        <Box style={{ flex: 2 }}>
          <Card shadow="sm" padding="lg" radius="lg" mb="lg">
            <Text weight={600} size="lg" mb="md">
              Shipping Information
            </Text>

            <Group spacing="md" grow>
              <TextInput
                label="First Name"
                placeholder="John"
                value={formData.firstName}
                onChange={(e) => handleChange("firstName")(e.target.value)}
                error={errors.firstName}
                required
              />
              <TextInput
                label="Last Name"
                placeholder="Doe"
                value={formData.lastName}
                onChange={(e) => handleChange("lastName")(e.target.value)}
                error={errors.lastName}
                required
              />
            </Group>

            <TextInput
              label="Email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) => handleChange("email")(e.target.value)}
              error={errors.email}
              mt="md"
              required
            />

            <TextInput
              label="Phone"
              placeholder="+1 (555) 123-4567"
              value={formData.phone}
              onChange={(e) => handleChange("phone")(e.target.value)}
              mt="md"
            />

            <Textarea
              label="Address"
              placeholder="123 Main Street"
              value={formData.address}
              onChange={(e) => handleChange("address")(e.target.value)}
              error={errors.address}
              mt="md"
              required
            />

            <Group spacing="md" grow mt="md">
              <TextInput
                label="City"
                placeholder="New York"
                value={formData.city}
                onChange={(e) => handleChange("city")(e.target.value)}
                error={errors.city}
                required
              />
              <TextInput
                label="State"
                placeholder="NY"
                value={formData.state}
                onChange={(e) => handleChange("state")(e.target.value)}
                error={errors.state}
                required
              />
            </Group>

            <Group spacing="md" grow mt="md">
              <TextInput
                label="ZIP Code"
                placeholder="10001"
                value={formData.zipCode}
                onChange={(e) => handleChange("zipCode")(e.target.value)}
                error={errors.zipCode}
                required
              />
              <Select
                label="Country"
                data={[
                  { value: "US", label: "United States" },
                  { value: "CA", label: "Canada" },
                  { value: "UK", label: "United Kingdom" },
                ]}
                value={formData.country}
                onChange={handleChange("country")}
              />
            </Group>
          </Card>

          <Card shadow="sm" padding="lg" radius="lg">
            <Text weight={600} size="lg" mb="md">
              Payment Method
            </Text>

            <Group spacing="md" mb="md">
              <Button
                variant={formData.paymentMethod === "credit" ? "filled" : "outline"}
                color="brand"
                leftIcon={<IconCreditCard size={rem(18)} />}
                onClick={() => handleChange("paymentMethod")("credit")}
              >
                Credit Card
              </Button>
              <Button
                variant={formData.paymentMethod === "cash" ? "filled" : "outline"}
                color="brand"
                leftIcon={<IconCash size={rem(18)} />}
                onClick={() => handleChange("paymentMethod")("cash")}
              >
                Cash on Delivery
              </Button>
            </Group>

            {formData.paymentMethod === "credit" && (
              <>
                <TextInput
                  label="Card Number"
                  placeholder="1234 5678 9012 3456"
                  value={formData.cardNumber}
                  onChange={(e) => handleChange("cardNumber")(e.target.value)}
                  error={errors.cardNumber}
                  required
                />

                <Group spacing="md" grow mt="md">
                  <TextInput
                    label="Expiry Date"
                    placeholder="MM/YY"
                    value={formData.cardExpiry}
                    onChange={(e) => handleChange("cardExpiry")(e.target.value)}
                    error={errors.cardExpiry}
                    required
                  />
                  <TextInput
                    label="CVV"
                    placeholder="123"
                    value={formData.cardCvv}
                    onChange={(e) => handleChange("cardCvv")(e.target.value)}
                    error={errors.cardCvv}
                    required
                  />
                </Group>
              </>
            )}
          </Card>
        </Box>

        <Box style={{ flex: 1 }}>
          <Card shadow="sm" padding="lg" radius="lg" sticky>
            <Text weight={600} size="lg" mb="md">
              Order Summary
            </Text>

            {safeCartItems.length === 0 ? (
              <Text color="dimmed">No items in cart</Text>
            ) : (
              <>
                {safeCartItems.map((item) => {
                  const product = products.find((p) => p.id === item.productId) || null;
                  if (!product) return null;
                  return (
                    <Group key={item.productId} position="apart" mb="xs">
                      <Text size="sm" lineClamp={1}>
                        {product.name} × {item.quantity}
                      </Text>
                      <Text size="sm" weight={500}>
                        {formatPrice(item.priceAtAdd * item.quantity)}
                      </Text>
                    </Group>
                  );
                })}

                <Divider my="sm" />

                <Group position="apart" mb="sm">
                  <Text>Subtotal</Text>
                  <Text weight={500}>{formatPrice(total)}</Text>
                </Group>

                <Group position="apart" mb="sm">
                  <Text>Shipping</Text>
                  <Text weight={500} color="success.6">
                    {total >= 50 ? "Free" : formatPrice(9.99)}
                  </Text>
                </Group>

                <Divider my="sm" />

                <Group position="apart" mb="lg">
                  <Text weight={600} size="lg">
                    Total
                  </Text>
                  <Text weight={700} size="xl" color="success.6">
                    {formatPrice(total + (total >= 50 ? 0 : 9.99))}
                  </Text>
                </Group>
              </>
            )}

            <Button
              type="submit"
              rightIcon={<IconCheck size={rem(18)} />}
              fullWidth
              size="lg"
              loading={submitting}
              disabled={safeCartItems.length === 0}
            >
              Place Order
            </Button>
          </Card>
        </Box>
      </Group>
    </form>
  );
};

export default CheckoutForm;