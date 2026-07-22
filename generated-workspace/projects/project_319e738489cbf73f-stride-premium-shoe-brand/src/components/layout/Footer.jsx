import { Box, Container, Group, Text, Anchor, Stack, Divider, rem } from "@mantine/core";
import { IconBrandInstagram, IconBrandFacebook, IconBrandTwitter, IconMail } from "@tabler/icons-react";
import siteContent from "../../data/siteContent";

const Footer = () => {
  const footerLinks = Array.isArray(siteContent.footer?.links) ? siteContent.footer.links : [];
  const socialLinks = Array.isArray(siteContent.footer?.social) ? siteContent.footer.social : [];
  const copyright = siteContent.footer?.copyright || "© 2024 Stride. All rights reserved.";
  const brandName = siteContent.brand?.name || "Stride";
  const brandDescription = siteContent.brand?.description || "Premium footwear for every stride.";

  return (
    <Box
      component="footer"
      style={{
        backgroundColor: "var(--mantine-color-slate-9)",
        color: "var(--mantine-color-slate-1)"
      }}
      pt={64}
      pb={32}
      mt={64}
    >
      <Container size="xl">
        <Stack gap="xl">
          <Group justify="space-between" align="flex-start" wrap="nowrap" gap="xl">
            <Box maw={400}>
              <Text size="xl" fw={700} mb="sm" c="white">
                {brandName}
              </Text>
              <Text size="sm" c="slate.3" maw={300}>
                {brandDescription}
              </Text>
            </Box>

            <Group gap="xl" visibleFrom="sm">
              <Stack gap="xs" maw={200}>
                <Text size="sm" fw={600} c="white" mb="xs">
                  Quick Links
                </Text>
                {footerLinks.map((link, index) => (
                  <Anchor
                    key={index}
                    href={link.href}
                    size="sm"
                    c="slate.3"
                    style={{ textDecoration: "none" }}
                  >
                    {link.label}
                  </Anchor>
                ))}
              </Stack>

              <Stack gap="xs" maw={200}>
                <Text size="sm" fw={600} c="white" mb="xs">
                  Connect
                </Text>
                {socialLinks.map((social, index) => (
                  <Anchor
                    key={index}
                    href={social.href}
                    size="sm"
                    c="slate.3"
                    style={{ textDecoration: "none" }}
                  >
                    {social.label}
                  </Anchor>
                ))}
              </Stack>
            </Group>
          </Group>

          <Divider color="slate.7" />

          <Group justify="space-between" align="center" wrap="nowrap">
            <Text size="xs" c="slate.4">
              {copyright}
            </Text>
            <Group gap="xs">
              <IconBrandInstagram size={rem(20)} style={{ color: "var(--mantine-color-slate-4)" }} />
              <IconBrandFacebook size={rem(20)} style={{ color: "var(--mantine-color-slate-4)" }} />
              <IconBrandTwitter size={rem(20)} style={{ color: "var(--mantine-color-slate-4)" }} />
            </Group>
          </Group>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer;