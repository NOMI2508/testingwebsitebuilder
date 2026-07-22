import { Grid, GridCol, Skeleton } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import MockChart from "../common/MockChart";
import SectionHeading from "../common/SectionHeading";
import mockChartData from "../../data/mockChartData";

function ChartsSection({ loading = false }) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const safeChartData = mockChartData ?? {};

  if (loading) {
    return (
      <div>
        <SectionHeading title="Analytics Overview" description="Data visualizations for system metrics" />
        <Grid gutter="md">
          <GridCol span={isMobile ? 12 : 6}>
            <Skeleton height={280} />
          </GridCol>
          <GridCol span={isMobile ? 12 : 6}>
            <Skeleton height={280} />
          </GridCol>
          <GridCol span={12}>
            <Skeleton height={280} mt="md" />
          </GridCol>
        </Grid>
      </div>
    );
  }

  return (
    <div>
      <SectionHeading title="Analytics Overview" description="Data visualizations for system metrics" />
      <Grid gutter="md">
        <GridCol span={isMobile ? 12 : 6}>
          <MockChart chart={safeChartData.revenue} />
        </GridCol>
        <GridCol span={isMobile ? 12 : 6}>
          <MockChart chart={safeChartData.userActivity} />
        </GridCol>
        <GridCol span={12}>
          <MockChart chart={safeChartData.distribution} />
        </GridCol>
      </Grid>
    </div>
  );
}

export default ChartsSection;