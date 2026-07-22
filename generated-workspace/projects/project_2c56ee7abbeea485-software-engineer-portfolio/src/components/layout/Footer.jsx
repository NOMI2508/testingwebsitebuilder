import { Box, Group, Text, Anchor, Stack } from "@mantine/core";
import { IconChevronUp } from "@tabler/icons-react";
import { smoothScrollTo } from "../../lib/smoothScroll";
import SocialLinks from "../common/SocialLinks";
import { siteContent } from "../../data/siteContent";

const Footer = () => {
  const handleBackToTop = () => {
    smoothScrollTo("hero", 0);
  };

  const quickLinks = siteContent.navigation.map((item) => (
    <Anchor
      key={item.id}
      href={item.href}
      onClick={(e) => {
        e.preventDefault();
        const elementId = item.href.replace("#", "");
        smoothScrollTo(elementId);
      }}
      style={{
        color: "var(--mantine-color-gray-6)",
        textDecoration: "none",
        fontSize: "0.875rem",
        transition: "color 0.2s ease"
      }}
    >
      {item.label}
    </Anchor>
  ));

  return (
    <Box
      component="footer"
      style={{
        backgroundColor: "var(--mantine-color-gray-0)",
        borderTop: "1px solid var(--mantine-color-gray-3)",
        padding: "2rem 0"
      }}
    >
      <Box style={{ maxWidth: "1320px", margin: "0 auto", padding: "0 1rem" }}>
        <Group justify="space-between" align="flex-start" style={{ marginBottom: "1.5rem" }}>
          <Stack gap="xs">
            <Text style={{ fontWeight: 600, fontSize: "1.125rem" }}>
              {siteContent.personal.name}
            </Text>
            <Text size="sm" color="gray.6">
              {siteContent.personal.title}
            </Text>
          </Stack>

          <Group gap="xl" visibleFrom="sm">
            <Stack gap="xs">
              <Text size="sm" style={{ fontWeight: 500 }}>Quick Links</Text>
              {quickLinks}
            </Stack>
          </Group>

          <SocialLinks links={siteContent.socialLinks} />
        </Group>

        <Group justify="space-between" align="center" style={{ paddingTop: "1rem", borderTop: "1px solid var(--mantine-color-gray-3)" }}>
          <Text size="sm" color="gray.6">
            © {new Date().getFullYear()} {siteContent.personal.name}. All rights reserved.
          </Text>

          <Text size="sm" color="gray.6">
            Built with React & Mantine
          </Text>
        </Group>

        <Box
          style={{
            position: "fixed",
            bottom: "1.5rem",
            right: "1.5rem",
            zIndex: 50
          }}
        >
          <Anchor
            onClick={handleBackToTop}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "2.5rem",
              height: "2.5rem",
              borderRadius: "50%",
              backgroundColor: "var(--mantine-color-blue-6)",
              color: "white",
              textDecoration: "none",
              cursor: "pointer",
              transition: "background-color 0.2s ease, transform 0.2s ease"
            }}
          >
            <IconChevronUp size={20} />
          </Anchor>
        </Box>
      </Box>
    </Box>
  );
};

export default Footer;