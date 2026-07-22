import { Group, ActionIcon, NumberInput, rem } from "@mantine/core";
import { IconMinus, IconPlus } from "@tabler/icons-react";

const QuantitySelector = ({ value, onChange, min = 1, max = 99, disabled = false }) => {
  const handleIncrement = () => {
    if (value < max && onChange) {
      onChange(value + 1);
    }
  };

  const handleDecrement = () => {
    if (value > min && onChange) {
      onChange(value - 1);
    }
  };

  const parseValue = (val) => {
    const numValue = typeof val === "number" ? val : Number(val) || min;
    return Math.max(min, Math.min(numValue, max));
  };

  return (
    <Group spacing="xs" align="center">
      <ActionIcon
        variant="outline"
        color="gray"
        size="sm"
        onClick={handleDecrement}
        disabled={disabled || value <= min}
        aria-label="Decrease quantity"
      >
        <IconMinus size={rem(14)} />
      </ActionIcon>
      <NumberInput
        value={value}
        onChange={(val) => {
          const clampedValue = parseValue(val);
          if (onChange) {
            onChange(clampedValue);
          }
        }}
        min={min}
        max={max}
        disabled={disabled}
        hideControls
        styles={{
          input: {
            width: rem(50),
            textAlign: "center",
            fontSize: "var(--mantine-font-size-sm)",
          },
        }}
        aria-label="Quantity"
      />
      <ActionIcon
        variant="outline"
        color="gray"
        size="sm"
        onClick={handleIncrement}
        disabled={disabled || value >= max}
        aria-label="Increase quantity"
      >
        <IconPlus size={rem(14)} />
      </ActionIcon>
    </Group>
  );
};

export default QuantitySelector;