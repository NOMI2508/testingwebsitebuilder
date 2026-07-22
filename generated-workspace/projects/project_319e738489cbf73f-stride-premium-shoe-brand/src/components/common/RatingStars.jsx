import { Group, Text, rem } from "@mantine/core";
import { IconStar, IconStarHalf, IconStarFilled } from "@tabler/icons-react";

const RatingStars = ({ rating = 0, reviewCount = 0, size = 16 }) => {
  const safeRating = typeof rating === "number" ? rating : 0;
  const safeReviewCount = typeof reviewCount === "number" ? reviewCount : 0;
  
  const fullStars = Math.floor(safeRating);
  const hasHalfStar = safeRating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <Group gap={4} align="center">
      <Group gap={2}>
        {[...Array(fullStars)].map((_, i) => (
          <IconStarFilled key={`full-${i}`} size={rem(size)} style={{ color: "#d4af37" }} />
        ))}
        {hasHalfStar && <IconStarHalf size={rem(size)} style={{ color: "#d4af37" }} />}
        {[...Array(emptyStars)].map((_, i) => (
          <IconStar key={`empty-${i}`} size={rem(size)} style={{ color: "#cbd5e1" }} />
        ))}
      </Group>
      {safeReviewCount > 0 && (
        <Text size="xs" c="dimmed">
          ({safeReviewCount})
        </Text>
      )}
    </Group>
  );
};

export default RatingStars;