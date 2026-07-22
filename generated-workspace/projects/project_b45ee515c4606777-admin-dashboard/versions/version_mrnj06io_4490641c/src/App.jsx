import { AppShell, Burger, Group, Text, Drawer, ScrollArea, NavLink } from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { IconDashboard, IconUsers, IconPackage, IconShoppingCart, IconChartBar, IconSettings } from "@tabler/icons-react";
import DashboardHeader from "./components/layout/DashboardHeader";
import SidebarNav from "./components/layout/SidebarNav";
import StatsOverview from "./components/sections/StatsOverview";
import ChartsSection from "./components/sections/ChartsSection";
import ActivityTable from "./components/sections/ActivityTable";
import navigationItems from "./data/navigationItems";

const iconMap = {
  dashboard: IconDashboard,
  users: IconUsers,
  package: IconPackage,
  "shopping-cart": IconShoppingCart,
  "chart-bar": IconChartBar,
  settings: IconSettings,
};

function App() {
  const [mobileNavOpened, { toggle: toggleMobileNav, close: closeMobileNav }] = useDisclosure(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const safeNavItems = Array.isArray(navigationItems) ? navigationItems : [];

  const mobileNavLinks = safeNavItems.map((item) => {
    const Icon = iconMap[item.icon] ?? IconDashboard;
    return (
      <NavLink
        key={item.id}
        href={item.route ?? "#"}
        label={item.label ?? "Item"}
        leftSection={<Icon size={18} stroke={1.5} />}
        active={item.id === "dashboard"}
        variant="filled"
        color="primary"
        onClick={closeMobileNav}
      />
    );
  });

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: { base: 260 }, breakpoint: "sm", collapsed: { mobile: true } }}
      padding="md"
    >
      <AppShell.Header>
        <Group justify="space-between" h="100%" px="md" py="xs">
          <Group>
            {isMobile && (
              <Burger
                opened={mobileNavOpened}
                onClick={toggleMobileNav}
                aria-label="Toggle navigation"
                size="sm"
              />
            )}
            <Text size="xl" fw={700}>
              Admin Dashboard
            </Text>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="xs" hiddenFrom="sm">
        <ScrollArea>
          {mobileNavLinks}
        </ScrollArea>
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