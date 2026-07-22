import { useState, useEffect } from "react";
import { Box, Group, Text, Burger, Drawer, Stack, Anchor } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { smoothScrollTo, getActiveSection } from "../../lib/smoothScroll";
import ThemeToggle from "../common/ThemeToggle";
import { siteContent } from "../../data/siteContent";

const Navbar = () => {
  const [opened, setOpened] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    const handleScroll = () => {
      const section = getActiveSection();
      setActiveSection(section);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (e, href) => {
    e.preventDefault();
    const elementId = href.replace("#", "");
    smoothScrollTo(elementId);
    setOpened(false);
  };

  const navLinks = siteContent.navigation.map((item) => (
    <Anchor
      key={item.id}
      href={item.href}
      onClick={(e) => handleNavClick(e, item.href)}
      style={{
        color: activeSection === item.id ? "var(--mantine-color-blue-6)" : "inherit",
        fontWeight: activeSection === item.id ? 600 : 400,
        textDecoration: "none",
        transition: "color 0.2s ease"
      }}
    >
      {item.label}
    </Anchor>
  ));

  const mobileNavLinks = siteContent.navigation.map((item) => (
    <Text
      key={item.id}
      component="a"
      href={item.href}
      onClick={(e) => handleNavClick(e, item.href)}
      style={{
        color: activeSection === item.id ? "var(--mantine-color-blue-6)" : "inherit",
        fontWeight: activeSection === item.id ? 600 : 400,
        textDecoration: "none",
        fontSize: "1.25rem",
        padding: "0.75rem 0",
        cursor: "pointer"
      }}
    >
      {item.label}
    </Text>
  ));

  return (
    <>
      <Box
        component="nav"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          backgroundColor: "var(--mantine-color-body)",
          borderBottom: "1px solid var(--mantine-color-gray-3)",
          padding: "1rem 0"
        }}
      >
        <Group justify="space-between" align="center" style={{ maxWidth: "1320px", margin: "0 auto", padding: "0 1rem" }}>
          <Text
            component="a"
            href="#hero"
            onClick={(e) => handleNavClick(e, "#hero")}
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              textDecoration: "none",
              color: "var(--mantine-color-blue-6)",
              cursor: "pointer"
            }}
          >
            {siteContent.personal.name.split(" ")[0]}
          </Text>

          {isMobile ? (
            <Group gap="sm">
              <ThemeToggle />
              <Burger opened={opened} onClick={() => setOpened(!opened)} size="sm" />
            </Group>
          ) : (
            <Group gap="xl">{navLinks}</Group>
          )}
        </Group>
      </Box>

      <Drawer
        opened={opened}
        onClose={() => setOpened(false)}
        title={siteContent.personal.name.split(" ")[0]}
        padding="md"
        size="70%"
        position="right"
      >
        <Stack gap="md">{mobileNavLinks}</Stack>
      </Drawer>
    </>
  );
};

export default Navbar;