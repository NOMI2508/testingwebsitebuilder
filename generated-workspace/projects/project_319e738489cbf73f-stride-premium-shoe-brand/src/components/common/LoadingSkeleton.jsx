import { Skeleton, SimpleGrid, Card, rem } from "@mantine/core";

const LoadingSkeleton = ({ count = 8, height = 350 }) => {
  const safeCount = typeof count === "number" ? count : 8;
  const safeHeight = typeof height === "number" ? height : 350;

  return (
    <SimpleGrid cols={{ base: 1, xs: 2, sm: 3, lg: 4 }} spacing="lg">
      {[...Array(safeCount)].map((_, index) => (
        <Card key={index} padding="md" radius="md" shadow="sm">
          <Skeleton height={rem(safeHeight * 0.7)} radius="md" mb="md" />
          <Skeleton height={16} width="80%" radius="sm" mb="xs" />
          <Skeleton height={14} width="60%" radius="sm" mb="md" />
          <Skeleton height={20} width="40%" radius="sm" />
        </Card>
      ))}
    </SimpleGrid>
  );
};

export default LoadingSkeleton;