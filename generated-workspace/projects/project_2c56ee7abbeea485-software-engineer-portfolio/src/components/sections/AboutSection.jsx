import { Container, Title, Text, Group, Stack, Paper, Badge, Button, Box } from "@mantine/core";
import { IconDownload, IconCheck } from "@tabler/icons-react";
import { siteContent } from "../../data/siteContent";
import SocialLinks from "../common/SocialLinks";

const AboutSection = () => {
  return (
    <Box
      id="about"
      style={{
        padding: "6rem 0",
        backgroundColor: "var(--mantine-color-gray-0)"
      }}
    >
      <Container size="lg">
        <Stack gap="xl">
          <Stack gap="xs" style={{ textAlign: "center" }}>
            <Title order={2} style={{ fontSize: "2.5rem", fontWeight: 700 }}>
              About Me
            </Title>
            <Text c="gray.6" size="lg" style={{ maxWidth: "600px", margin: "0 auto" }}>
              Get to know the engineer behind the code
            </Text>
          </Stack>

          <Paper
            shadow="md"
            radius="lg"
            style={{
              padding: "3rem",
              backgroundColor: "var(--mantine-color-body)"
            }}
          >
            <Group align="flex-start" gap="xl" style={{ flexDirection: "row" }}>
              <Stack gap="lg" style={{ flex: 1 }}>
                {siteContent.about.bio.map((paragraph, index) => (
                  <Text key={index} size="lg" style={{ lineHeight: 1.7 }}>
                    {paragraph}
                  </Text>
                ))}

                <Stack gap="sm" style={{ marginTop: "1rem" }}>
                  {siteContent.about.highlights.map((highlight, index) => (
                    <Group key={index} gap="sm">
                      <Badge color="green" size="lg" variant="filled" style={{ minWidth: "32px", height: "24px" }}>
                        <IconCheck size={14} />
                      </Badge>
                      <Text size="md">{highlight}</Text>
                    </Group>
                  ))}
                </Stack>

                <Group gap="lg" style={{ marginTop: "2rem" }}>
                  <Button
                    component="a"
                    href={siteContent.personal.resumeUrl}
                    download
                    leftSection={<IconDownload size={18} />}
                    size="md"
                    style={{
                      background: "linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)",
                      border: "none"
                    }}
                  >
                    Download Resume
                  </Button>

                  <SocialLinks links={siteContent.socialLinks} />
                </Group>
              </Stack>
            </Group>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
};

export default AboutSection;