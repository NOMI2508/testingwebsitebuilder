import { AppShell, NavLink, Group, ActionIcon, ScrollArea, Drawer, Burger } from "@mantine/core";
import { IconDashboard, IconUsers, IconPackage, IconShoppingCart, IconChartBar, IconSettings, IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import navigationItems from "../../data/navigationItems";

const navIconMap = {
  dashboard: IconDashboard,
  users: IconUsers,
  package: IconPackage,
  "shopping-cart": IconShoppingCart,
  "chart-bar": IconChartBar,
  settings: IconSettings,
};

function SidebarNav() {
  const [collapsed, { toggle: toggleCollapsed }] = useDisclosure(false);
  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] = useDisclosure(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const safeNavItems = Array.isArray(navigationItems) ? navigationItems : [];

  const navLinks = safeNavItems.map((item) => {
    const Icon = navIconMap[item.icon] ?? IconDashboard;
    return (
      <NavLink
        key={item.id}
        href={item.route ?? "#"}
        label={collapsed && !isMobile ? undefined : item.label ?? "Item"}
        leftSection={<Icon size={18} stroke={1.5} />}
        active={item.id === "dashboard"}
        variant="filled"
        color="primary"
        onClick={isMobile ? closeMobile : undefined}
      />
    );
  });

  if (isMobile) {
    return (
      <>
        <Burger
          opened={mobileOpened}
          onClick={toggleMobile}
          aria-label="Toggle navigation"
          size="sm"
        />
        <Drawer
          opened={mobileOpened}
          onClose={closeMobile}
          title="Navigation"
          padding="xs"
          size="sm"
        >
          <ScrollArea>
            {navLinks}
          </ScrollArea>
        </Drawer>
      </>
    );
  }

  return (
    <>
      <Group justify="flex-end" mb="xs">
        <ActionIcon
          variant="subtle"
          color="gray"
          onClick={toggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <IconChevronRight size={16} /> : <IconChevronLeft size={16} />}
        </ActionIcon>
      </Group>
      <ScrollArea>
        {navLinks}
      </ScrollArea>
    </>
  );
}

export default SidebarNav;