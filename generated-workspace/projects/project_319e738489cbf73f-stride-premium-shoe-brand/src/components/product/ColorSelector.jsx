import { Group, UnstyledButton, Text, rem } from "@mantine/core";

const colorMap = {
  black: "#1e293b",
  white: "#ffffff",
  brown: "#92400e",
  tan: "#d6d3d1",
  navy: "#1e3a8a",
  blue: "#3b82f6",
  gray: "#6b7280",
  red: "#dc2626",
  green: "#16a34a",
  taupe: "#78716c",
  yellow: "#eab308"
};

const ColorSelector = ({ colors = [], selectedColor, onSelectColor }) => {
  const safeColors = Array.isArray(colors) ? colors : [];
  const safeSelectedColor = selectedColor !== undefined ? selectedColor : null;

  const handleColorSelect = (color) => {
    if (onSelectColor) {
      onSelectColor(color);
    }
  };

  const getColorStyle = (color) => {
    const baseColor = colorMap[color.toLowerCase()] || "#64748b";
    return {
      backgroundColor: baseColor,
      border: color.toLowerCase() === "white" 
        ? "2px solid var(--mantine-color-slate-3)" 
        : "2px solid transparent",
      outline: safeSelectedColor === color ? "2px solid var(--mantine-color-gold-6)" : "none",
      outlineOffset: safeSelectedColor === color ? "2px" : "0"
    };
  };

  return (
    <div>
      <Text size="sm" fw={500} mb="xs">
        Select Color
      </Text>
      <Group gap="xs" wrap="wrap">
        {safeColors.map((color, index) => (
          <UnstyledButton
            key={index}
            onClick={() => handleColorSelect(color)}
            aria-label={`Select ${color} color`}
            style={{
              width: rem(32),
              height: rem(32),
              borderRadius: "50%",
              ...getColorStyle(color),
              transition: "all 150ms ease",
              transform: safeSelectedColor === color ? "scale(1.1)" : "scale(1)"
            }}
          />
        ))}
      </Group>
    </div>
  );
};

export default ColorSelector;