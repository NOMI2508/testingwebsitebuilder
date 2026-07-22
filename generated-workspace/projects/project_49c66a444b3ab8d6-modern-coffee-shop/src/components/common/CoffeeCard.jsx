import { Card, Text, Image, Group, Badge } from "@mantine/core";
import formatPrice from "../../lib/formatPrice";

const CoffeeCard = ({ coffee, onClick }) => {
  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="lg"
      style={{
        backgroundColor: "var(--mantine-color-cream-0)",
        cursor: "pointer",
        transition: "transform 0.2s ease, box-shadow 0.2s ease"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "var(--mantine-shadow-md)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "var(--mantine-shadow-sm)";
      }}
      onClick={() => onClick && onClick(coffee)}
    >
      <Card.Section>
        <Image
          src={coffee.image}
          alt={coffee.name}
          height={200}
          style={{ objectFit: "cover" }}
        />
      </Card.Section>
      
      <Group position="apart" mt="md" mb="xs">
        <Text weight={600} size="lg" color="coffeeBrown.7">
          {coffee.name}
        </Text>
        <Badge color="coffeeBrown" variant="light" size="lg">
          {formatPrice(coffee.price)}
        </Badge>
      </Group>
      
      <Text size="sm" color="coffeeBrown.6" lineClamp={3}>
        {coffee.description}
      </Text>
    </Card>
  );
};

export default CoffeeCard;