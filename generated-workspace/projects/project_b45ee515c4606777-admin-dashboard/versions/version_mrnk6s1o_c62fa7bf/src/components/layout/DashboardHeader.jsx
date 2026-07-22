import { AppShell, Group, Text, ActionIcon, Avatar, Menu, Switch, rem, useMantineColorScheme } from "@mantine/core";
import { IconBell, IconSearch, IconMoon, IconSun, IconUser, IconSettings, IconLogout, IconChevronDown } from "@tabler/icons-react";
import { useLocalStorage } from "@mantine/hooks";

function DashboardHeader() {
  const [opened, { toggle }] = useLocalStorage({ key: "header-menu-open", defaultValue: false });
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <AppShell.Header>
      <Group justify="space-between" h="100%" px="md" py="xs">
        <Group>
          <Text size="xl" fw={700} visibleFrom="sm">
            Admin Dashboard
          </Text>
        </Group>
        <Group gap="sm">
          <ActionIcon variant="subtle" color="gray" hiddenFrom="xs">
            <IconSearch size={18} />
          </ActionIcon>
          <ActionIcon variant="subtle" color="gray">
            <IconBell size={18} />
          </ActionIcon>
          <Switch
            size="xs"
            checked={isDark}
            onChange={toggleColorScheme}
            onLabel={<IconSun size={12} stroke={2.5} />}
            offLabel={<IconMoon size={12} stroke={2.5} />}
          />
          <Menu opened={opened} onChange={toggle} width={200}>
            <Menu.Target>
              <Group gap={4} style={{ cursor: "pointer" }}>
                <Avatar size="sm" color="primary">
                  <IconUser size={14} />
                </Avatar>
                <IconChevronDown size={14} stroke={1.5} hiddenFrom="xs" />
              </Group>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>Account</Menu.Label>
              <Menu.Item leftSection={<IconUser size={14} />}>
                Profile
              </Menu.Item>
              <Menu.Item leftSection={<IconSettings size={14} />}>
                Settings
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item leftSection={<IconLogout size={14} />} color="red">
                Logout
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>
    </AppShell.Header>
  );
}

export default DashboardHeader;