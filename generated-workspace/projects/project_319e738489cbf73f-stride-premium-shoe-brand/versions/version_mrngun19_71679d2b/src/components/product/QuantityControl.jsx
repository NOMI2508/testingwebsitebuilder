import { Group, ActionIcon, Text, rem } from "@mantine/core";
import { IconMinus, IconPlus } from "@tabler/icons-react";

const QuantityControl = ({ quantity = 1, min = 1, max = 10, onChange }) => {
  const safeQuantity = typeof quantity === "number" ? quantity : 1;
  const safeMin = typeof min === "number" ? min : 1;
  const safeMax = typeof max === "number" ? max : 10;

  const handleDecrement = () => {
    if (safeQuantity > safeMin && onChange) {
      onChange(safeQuantity - 1);
    }
  };

  const handleIncrement = () => {
    if (safeQuantity < safeMax && onChange) {
      onChange(safeQuantity + 1);
    }
  };

  return (
    <Group gap={4} align="center">
      <ActionIcon
        variant="outline"
        size="sm"
        radius="sm"
        aria-label="Decrease quantity"
        onClick={handleDecrement}
        disabled={safeQuantity <= safeMin}
      >
        <IconMinus size={rem(16)} />
      </ActionIcon>
      <Text size="sm" fw={500} w={32} ta="center">
        {safeQuantity}
      </Text>
      <ActionIcon
        variant="outline"
        size="sm"
        radius="sm"
        aria-label="Increase quantity"
        onClick={handleIncrement}
        disabled={safeQuantity >= safeMax}
      >
        <IconPlus size={rem(16)} />
      </ActionIcon>
    </Group>
  );
};

export default QuantityControl;