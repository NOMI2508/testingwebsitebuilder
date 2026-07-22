import { Card, Group, Image, Text, ActionIcon, rem } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import QuantityControl from "../product/QuantityControl";
import formatPrice from "../../lib/formatPrice";

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const safeItem = item || {};
  const name = safeItem.name || "Unnamed Product";
  const price = typeof safeItem.price === "number" ? safeItem.price : 0;
  const quantity = typeof safeItem.quantity === "number" ? safeItem.quantity : 1;
  const image = safeItem.image || "";
  const selectedSize = safeItem.selectedSize !== undefined ? safeItem.selectedSize : null;
  const selectedColor = safeItem.selectedColor !== undefined ? safeItem.selectedColor : null;
  const itemId = safeItem.id || "";

  const handleQuantityChange = (newQuantity) => {
    if (onUpdateQuantity) {
      onUpdateQuantity(itemId, newQuantity);
    }
  };

  const handleRemove = () => {
    if (onRemove) {
      onRemove(itemId);
    }
  };

  const itemTotal = price * quantity;

  return (
    <Card padding="md" radius="md" shadow="sm">
      <Group align="flex-start" gap="lg">
        <Image
          src={image}
          alt={name}
          width={80}
          height={80}
          fit="cover"
          radius="md"
          fallbackSrc="https://placehold.co/80x80?text=Product"
        />
        <div style={{ flex: 1 }}>
          <Group justify="space-between" align="flex-start">
            <div>
              <Text fw={600} size="sm" mb={4}>
                {name}
              </Text>
              {selectedSize && (
                <Text size="xs" c="dimmed">
                  Size: {selectedSize}
                </Text>
              )}
              {selectedColor && (
                <Text size="xs" c="dimmed">
                  Color: {selectedColor}
                </Text>
              )}
            </div>
            <Text fw={600} size="sm">
              {formatPrice(itemTotal)}
            </Text>
          </Group>
          <Group justify="space-between" mt="md">
            <QuantityControl
              quantity={quantity}
              min={1}
              max={10}
              onChange={handleQuantityChange}
            />
            <ActionIcon
              variant="subtle"
              color="red"
              size="sm"
              radius="sm"
              aria-label="Remove item"
              onClick={handleRemove}
            >
              <IconTrash size={rem(16)} />
            </ActionIcon>
          </Group>
        </div>
      </Group>
    </Card>
  );
};

export default CartItem;