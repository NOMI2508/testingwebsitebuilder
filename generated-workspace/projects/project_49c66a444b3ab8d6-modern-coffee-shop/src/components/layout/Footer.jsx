import { Box, Text, Group, Anchor, Stack } from "@mantine/core";
import siteContent from "../../data/siteContent";

const Footer = () => {
  const { contact } = siteContent;

  return (
    <Box
      component="footer"
      style={{
        backgroundColor: "var(--mantine-color-coffeeBrown-7)",
        color: "var(--mantine-color-cream-2)",
        padding: "var(--mantine-spacing-xl) var(--mantine-spacing-md)"
      }}
    >
      <Stack spacing="md">
        <Text size="lg" weight={600} color="cream.2">
          Brew & Bean Café
        </Text>
        
        <Text size="sm" color="cream.3">
          {contact.address}
        </Text>
        
        <Group spacing="lg">
          <Anchor href={`tel:${contact.phone}`} color="cream.3" size="sm">
            {contact.phone}
          </Anchor>
          <Anchor href={`mailto:${contact.email}`} color="cream.3" size="sm">
            {contact.email}
          </Anchor>
        </Group>
        
        <Box>
          <Text size="sm" weight={500} color="cream.2" mb={4}>
            Hours
          </Text>
          {contact.hours.map((hour) => (
            <Text key={hour.day} size="xs" color="cream.4">
              {hour.day}: {hour.time}
            </Text>
          ))}
        </Box>
        
        <Group spacing="sm" mt="sm">
          <Anchor
            href={`https://instagram.com/${contact.socialMedia.instagram.replace("@", "")}`}
            color="cream.3"
            size="sm"
            target="_blank"
            rel="noopener noreferrer"
          >
            Instagram
          </Anchor>
          <Anchor
            href={`https://facebook.com/${contact.socialMedia.facebook}`}
            color="cream.3"
            size="sm"
            target="_blank"
            rel="noopener noreferrer"
          >
            Facebook
          </Anchor>
          <Anchor
            href={`https://twitter.com/${contact.socialMedia.twitter.replace("@", "")}`}
            color="cream.3"
            size="sm"
            target="_blank"
            rel="noopener noreferrer"
          >
            Twitter
          </Anchor>
        </Group>
        
        <Text size="xs" color="cream.5" mt="md">
          © {new Date().getFullYear()} Brew & Bean Café. All rights reserved.
        </Text>
      </Stack>
    </Box>
  );
};

export default Footer;