import { Card, Group, Text, ThemeIcon, Box } from "@mantine/core";
import { IconArrowUp, IconArrowDown, IconUsers, IconCreditCard, IconShoppingCart, IconChartLine } from "@tabler/icons-react";

const statIconMap = {
  users: IconUsers,
  "credit-card": IconCreditCard,
  "shopping-cart": IconShoppingCart,
  "chart-line": IconChartLine,
};

function StatsCard({ stat }) {
  const safeStat = stat ?? {};
  const Icon = statIconMap[safeStat.icon] ?? IconUsers;
  const TrendIcon = safeStat.trend === "up" ? IconArrowUp : IconArrowDown;
  const trendColor = safeStat.trend === "up" ? "secondary" : "red";

  return (
    <Card>
      <Group justify="space-between" align="flex-start">
        <Box>
          <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={4}>
            {safeStat.title ?? "Metric"}
          </Text>
          <Text size="2rem" fw={700} lh={1.2}>
            {safeStat.value ?? "0"}
          </Text>
          <Group gap={4} mt={8}>
            <ThemeIcon color={trendColor} size="sm" variant="light">
              <TrendIcon size={12} />
            </ThemeIcon>
            <Text size="xs" c={trendColor} fw={500}>
              {safeStat.change ?? "0%"}
            </Text>
            <Text size="xs" c="dimmed">
              from last month
            </Text>
          </Group>
        </Box>
        <ThemeIcon size="xl" variant="light" color="primary">
          <Icon size={24} />
        </ThemeIcon>
      </Group>
    </Card>
  );
}

export default StatsCard;