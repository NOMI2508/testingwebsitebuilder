import { Modal, Image, Text, Group, Badge } from "@mantine/core";
import formatPrice from "../../lib/formatPrice";

const Lightbox = ({ coffee, opened, onClose }) => {
  if (!coffee) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={coffee.name}
      centered
      size="md"
      styles={{
        title: {
          color: "var(--mantine-color-coffeeBrown-7)",
          fontWeight: 600
        }
      }}
    >
      <Image
        src={coffee.image}
        alt={coffee.name}
        style={{ objectFit: "cover", width: "100%", borderRadius: "var(--mantine-radius-md)" }}
        mb="md"
      />
      <Group position="apart" mb="sm">
        <Text weight={600} color="coffeeBrown.7">
          {coffee.name}
        </Text>
        <Badge color="coffeeBrown" size="lg">
          {formatPrice(coffee.price)}
        </Badge>
      </Group>
      <Text color="coffeeBrown.6" mb="md">
        {coffee.description}
      </Text>
    </Modal>
  );
};

export default Lightbox;