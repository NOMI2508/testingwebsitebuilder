import { SimpleGrid, Skeleton, Group } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import StatsCard from "../common/StatsCard";
import SectionHeading from "../common/SectionHeading";
import mockStats from "../../data/mockStats";

function StatsOverview({ loading = false }) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const safeStats = Array.isArray(mockStats) ? mockStats : [];

  if (loading) {
    return (
      <div>
        <SectionHeading title="Overview Statistics" description="Key performance metrics at a glance" />
        <SimpleGrid cols={isMobile ? 1 : 2} spacing="md">
          {[1, 2, 3, 4].map((item) => (
            <Skeleton key={item} height={120} />
          ))}
        </SimpleGrid>
      </div>
    );
  }

  return (
    <div>
      <SectionHeading title="Overview Statistics" description="Key performance metrics at a glance" />
      <SimpleGrid cols={isMobile ? 1 : 2} spacing="md">
        {safeStats.map((stat) => (
          <StatsCard key={stat?.id ?? Math.random()} stat={stat} />
        ))}
      </SimpleGrid>
    </div>
  );
}

export default StatsOverview;