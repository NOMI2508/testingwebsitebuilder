import { Paper, Text, Group, Box, Skeleton, Center } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";

function MockChart({ chart, loading = false }) {
  const safeChart = chart ?? {};
  const safeData = Array.isArray(safeChart.data) ? safeChart.data : [];
  const isMobile = useMediaQuery("(max-width: 768px)");

  if (loading) {
    return (
      <Paper>
        <Skeleton height={24} width="60%" mb="sm" />
        <Skeleton height={isMobile ? 180 : 240} />
      </Paper>
    );
  }

  const chartHeight = isMobile ? 180 : 240;

  return (
    <Paper>
      <Text size="sm" fw={600} mb="md">
        {safeChart.title ?? "Chart"}
      </Text>
      <Box h={chartHeight} style={{ position: "relative", backgroundColor: "var(--mantine-color-gray-0)" }}>
        <Center h="100%">
          <Text c="dimmed" size="sm">
            {safeChart.type === "line" && "📈 Line chart visualization"}
            {safeChart.type === "bar" && "📊 Bar chart visualization"}
            {safeChart.type === "pie" && "🥧 Pie chart visualization"}
          </Text>
        </Center>
      </Box>
      {safeChart.type === "bar" && safeData.length > 0 && (
        <Group justify="center" mt="sm" gap="xs">
          {safeData.map((item, index) => (
            <Box key={index} style={{ textAlign: "center" }}>
              <Text size="xs" c="dimmed">{item.day ?? item.date ?? "?"}</Text>
            </Box>
          ))}
        </Group>
      )}
    </Paper>
  );
}

export default MockChart;