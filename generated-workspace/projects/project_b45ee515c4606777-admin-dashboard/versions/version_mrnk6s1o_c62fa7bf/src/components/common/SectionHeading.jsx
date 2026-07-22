import { Title, Text, Box } from "@mantine/core";

function SectionHeading({ title, description }) {
  return (
    <Box mb="lg">
      <Title order={2} size="h3" fw={600} mb={description ? 4 : 0}>
        {title ?? "Section"}
      </Title>
      {description && (
        <Text c="dimmed" size="sm">
          {description}
        </Text>
      )}
    </Box>
  );
}

export default SectionHeading;