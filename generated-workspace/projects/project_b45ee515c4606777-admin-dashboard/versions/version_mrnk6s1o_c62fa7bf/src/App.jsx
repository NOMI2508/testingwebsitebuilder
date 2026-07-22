import { AppShell, Group, Text, SimpleGrid, Card, Title, Box, rem } from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import DashboardHeader from "./components/layout/DashboardHeader";
import SidebarNav from "./components/layout/SidebarNav";
import StatsOverview from "./components/sections/StatsOverview";
import ChartsSection from "./components/sections/ChartsSection";
import ActivityTable from "./components/sections/ActivityTable";

function UsersSection() {
  return (
    <Box id="users" pt="xl">
      <Title order={2} mb="md">Users Management</Title>
      <Card withBorder>
        <Text p="xl">Users page content - manage user accounts, permissions, and profiles.</Text>
      </Card>
    </Box>
  );
}

function ProductsSection() {
  return (
    <Box id="products" pt="xl">
      <Title order={2} mb="md">Products Management</Title>
      <Card withBorder>
        <Text p="xl">Products page content - manage product catalog, inventory, and pricing.</Text>
      </Card>
    </Box>
  );
}

function OrdersSection() {
  return (
    <Box id="orders" pt="xl">
      <Title order={2} mb="md">Orders Management</Title>
      <Card withBorder>
        <Text p="xl">Orders page content - view and manage customer orders and transactions.</Text>
      </Card>
    </Box>
  );
}

function AnalyticsSection() {
  return (
    <Box id="analytics" pt="xl">
      <Title order={2} mb="md">Analytics</Title>
      <Card withBorder>
        <Text p="xl">Analytics page content - detailed reports and data insights.</Text>
      </Card>
    </Box>
  );
}

function SettingsSection() {
  return (
    <Box id="settings" pt="xl">
      <Title order={2} mb="md">Settings</Title>
      <Card withBorder>
        <Text p="xl">Settings page content - configure application preferences and system settings.</Text>
      </Card>
    </Box>
  );
}

function App() {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: { base: 260 }, breakpoint: "sm", collapsed: { mobile: true } }}
      padding="md"
    >
      <AppShell.Header>
        <DashboardHeader onMobileToggle={toggleMobile} />
      </AppShell.Header>

      <AppShell.Navbar p="xs">
        <SidebarNav />
      </AppShell.Navbar>

      <AppShell.Main>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <div id="dashboard">
            <StatsOverview />
            <ChartsSection />
            <ActivityTable />
          </div>
          <UsersSection />
          <ProductsSection />
          <OrdersSection />
          <AnalyticsSection />
          <SettingsSection />
        </div>
      </AppShell.Main>
    </AppShell>
  );
}

export default App;