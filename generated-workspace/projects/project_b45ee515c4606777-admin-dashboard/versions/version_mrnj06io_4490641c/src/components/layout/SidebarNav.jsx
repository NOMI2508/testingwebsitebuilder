import { AppShell, NavLink, Group, Box, Text, ActionIcon, ScrollArea } from "@mantine/core";
import { IconDashboard, IconUsers, IconPackage, IconShoppingCart, IconChartBar, IconSettings, IconChevronLeft, IconChevronRight, IconMenu2 } from "@tabler/icons-react";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import navigationItems from "../../data/navigationItems";

const iconMap = {
  dashboard: IconDashboard,
  users: IconUsers,
  package: IconPackage,
  "shopping-cart": IconShoppingCart,
  "chart-bar": IconChartBar,
  settings: IconSettings,
};

function SidebarNav() {
  const [collapsed, { toggle }] = useDisclosure(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const safeNavItems = Array.isArray(navigationItems) ? navigationItems : [];

  const navLinks = safeNavItems.map((item) => {
    const Icon = iconMap[item.icon] ?? IconDashboard;
    return (
      <NavLink
        key={item.id}
        href={item.route ?? "#"}
        label={collapsed ? undefined : item.label ?? "Item"}
        leftSection={<Icon size={18} stroke={1.5} />}
        active={item.id === "dashboard"}
        variant="filled"
        color="primary"
      />
    );
  });

  if (isMobile) {
    return null;
  }

  return (
    <AppShell.Navbar p="xs" style={{ transition: "width 200ms ease" }}>
      <Group justify="flex-end" mb="xs">
        <ActionIcon
          variant="subtle"
          color="gray"
          onClick={toggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <IconChevronRight size={16} /> : <IconChevronLeft size={16} />}
        </ActionIcon>
      </Group>
      <ScrollArea>
        {navLinks}
      </ScrollArea>
    </AppShell.Navbar>
  );
}

export default SidebarNav;