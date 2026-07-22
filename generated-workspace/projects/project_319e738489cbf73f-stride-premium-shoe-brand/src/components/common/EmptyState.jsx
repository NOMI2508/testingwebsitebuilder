import { Center, Stack, Text, Button, rem } from "@mantine/core";
import { IconSearch, IconShoppingCart, IconPackage } from "@tabler/icons-react";

const EmptyState = ({ 
  type = "search", 
  title = "No results found", 
  description = "Try adjusting your search or filter criteria",
  actionLabel = "Clear Filters",
  onAction 
}) => {
  const safeTitle = typeof title === "string" ? title : "No results found";
  const safeDescription = typeof description === "string" ? description : "";
  const safeActionLabel = typeof actionLabel === "string" ? actionLabel : null;

  const getIcon = () => {
    switch (type) {
      case "cart":
        return <IconShoppingCart size={rem(64)} stroke={1.5} />;
      case "products":
        return <IconPackage size={rem(64)} stroke={1.5} />;
      case "search":
      default:
        return <IconSearch size={rem(64)} stroke={1.5} />;
    }
  };

  return (
    <Center py={64}>
      <Stack align="center" gap="lg">
        {getIcon()}
        <Stack align="center" gap="xs">
          <Text size="xl" fw={600} c="dark">
            {safeTitle}
          </Text>
          {safeDescription && (
            <Text size="sm" c="dimmed" maw={400} ta="center">
              {safeDescription}
            </Text>
          )}
        </Stack>
        {safeActionLabel && onAction && (
          <Button variant="outline" onClick={onAction}>
            {safeActionLabel}
          </Button>
        )}
      </Stack>
    </Center>
  );
};

export default EmptyState;