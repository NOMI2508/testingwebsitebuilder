import { Group, Button, Text, rem } from "@mantine/core";

const SizeSelector = ({ sizes = [], selectedSize, onSelectSize }) => {
  const safeSizes = Array.isArray(sizes) ? sizes : [];
  const safeSelectedSize = selectedSize !== undefined ? selectedSize : null;

  const handleSizeSelect = (size) => {
    if (onSelectSize) {
      onSelectSize(size);
    }
  };

  return (
    <div>
      <Text size="sm" fw={500} mb="xs">
        Select Size
      </Text>
      <Group gap="xs" wrap="wrap">
        {safeSizes.map((size, index) => (
          <Button
            key={index}
            variant={safeSelectedSize === size ? "filled" : "outline"}
            color={safeSelectedSize === size ? "gold" : "slate"}
            size="sm"
            radius="sm"
            onClick={() => handleSizeSelect(size)}
            style={{
              minWidth: rem(48),
              fontWeight: safeSelectedSize === size ? 600 : 400
            }}
          >
            {size}
          </Button>
        ))}
      </Group>
    </div>
  );
};

export default SizeSelector;