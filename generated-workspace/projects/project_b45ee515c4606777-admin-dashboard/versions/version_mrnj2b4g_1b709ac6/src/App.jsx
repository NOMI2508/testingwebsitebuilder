import { AppShell, Group, Text } from "@mantine/core";
import DashboardHeader from "./components/layout/DashboardHeader";
import SidebarNav from "./components/layout/SidebarNav";
import StatsOverview from "./components/sections/StatsOverview";
import ChartsSection from "./components/sections/ChartsSection";
import ActivityTable from "./components/sections/ActivityTable";

function App() {
  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: { base: 260 }, breakpoint: "sm", collapsed: { mobile: true } }}
      padding="md"
    >
      <AppShell.Header>
        <DashboardHeader />
      </AppShell.Header>

      <AppShell.Navbar p="xs">
        <SidebarNav />
      </AppShell.Navbar>

      <AppShell.Main>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <StatsOverview />
          <ChartsSection />
          <ActivityTable />
        </div>
      </AppShell.Main>
    </AppShell>
  );
}

export default App;