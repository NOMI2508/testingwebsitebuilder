import { ActionIcon } from "@mantine/core";
import { IconSun, IconMoon } from "@tabler/icons-react";
import { useTheme } from "../../context/ThemeContext";

const ThemeToggle = ({ size = "lg" }) => {
  const { colorScheme, toggleColorScheme } = useTheme();
  const iconSize = size === "sm" ? 18 : size === "lg" ? 22 : 20;

  return (
    <ActionIcon
      onClick={toggleColorScheme}
      size={size}
      variant="subtle"
      color="gray.7"
      aria-label="Toggle color scheme"
      style={{
        transition: "color 0.2s ease, transform 0.2s ease"
      }}
    >
      {colorScheme === "dark" ? (
        <IconSun size={iconSize} />
      ) : (
        <IconMoon size={iconSize} />
      )}
    </ActionIcon>
  );
};

export default ThemeToggle;