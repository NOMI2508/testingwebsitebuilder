import { Container, Title, Text, Timeline, Card, Group, Badge, Box, Button, Stack, Image } from "@mantine/core";
import { IconBriefcase, IconMapPin, IconCalendar } from "@tabler/icons-react";
import { formatDateRange } from "../../lib/formatDate";
import { siteContent } from "../../data/siteContent";

const ExperienceSection = () => {
  const experiences = [...siteContent.experience].reverse();

  return (
    <Box id="experience" style={{ padding: "4rem 0", backgroundColor: "var(--mantine-color-gray-0)" }}>
      <Container size="lg">
        <Stack align="center" style={{ marginBottom: "3rem" }}>
          <Title order={2} style={{ textAlign: "center", position: "relative" }}>
            Professional Experience
            <Box
              style={{
                position: "absolute",
                bottom: "-10px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "60px",
                height: "4px",
                backgroundColor: "var(--mantine-color-blue-6)",
                borderRadius: "2px"
              }}
            />
          </Title>
          <Text color="gray.6" style={{ textAlign: "center", maxWidth: "600px" }}>
            A timeline of my professional journey, showcasing roles, achievements, and technologies used along the way.
          </Text>
        </Stack>

        <Timeline active={0} bulletSize={28} lineWidth={2} color="blue.6">
          {experiences.map((exp, index) => (
            <Timeline.Item
              key={exp.id}
              bullet={<IconBriefcase size={16} />}
              title={
                <Group justify="space-between" style={{ width: "100%" }}>
                  <div>
                    <Text style={{ fontWeight: 600, fontSize: "1.25rem" }}>{exp.title}</Text>
                    <Text color="blue.6" style={{ fontWeight: 500 }}>{exp.company}</Text>
                  </div>
                  <Group gap="xs" visibleFrom="sm">
                    <IconCalendar size={16} color="var(--mantine-color-gray-6)" />
                    <Text size="sm" color="gray.6">{formatDateRange(exp.startDate, exp.endDate)}</Text>
                  </Group>
                </Group>
              }
              style={{ marginBottom: "2rem" }}
            >
              <Card
                style={{
                  marginLeft: "2rem",
                  marginTop: "1rem",
                  borderLeft: "3px solid var(--mantine-color-blue-1)"
                }}
                shadow="sm"
                padding="lg"
              >
                <Group justify="space-between" style={{ marginBottom: "1rem" }} hiddenFrom="sm">
                  <Group gap="xs">
                    <IconCalendar size={16} color="var(--mantine-color-gray-6)" />
                    <Text size="sm" color="gray.6">{formatDateRange(exp.startDate, exp.endDate)}</Text>
                  </Group>
                  <Group gap="xs">
                    <IconMapPin size={16} color="var(--mantine-color-gray-6)" />
                    <Text size="sm" color="gray.6">{exp.location}</Text>
                  </Group>
                </Group>

                <Group gap="xs" style={{ marginBottom: "1rem" }} visibleFrom="sm">
                  <IconMapPin size={16} color="var(--mantine-color-gray-6)" />
                  <Text size="sm" color="gray.6">{exp.location}</Text>
                </Group>

                <Stack gap="sm" style={{ marginBottom: "1rem" }}>
                  <Text weight={500}>Key Responsibilities:</Text>
                  <ul style={{ paddingLeft: "1.25rem", margin: 0 }}>
                    {exp.responsibilities.map((resp, idx) => (
                      <li key={idx} style={{ marginBottom: "0.25rem" }}>
                        <Text size="sm" color="gray.7">{resp}</Text>
                      </li>
                    ))}
                  </ul>
                </Stack>

                <Stack gap="sm" style={{ marginBottom: "1rem" }}>
                  <Text weight={500}>Notable Achievements:</Text>
                  <ul style={{ paddingLeft: "1.25rem", margin: 0 }}>
                    {exp.achievements.map((ach, idx) => (
                      <li key={idx} style={{ marginBottom: "0.25rem" }}>
                        <Text size="sm" color="gray.7">{ach}</Text>
                      </li>
                    ))}
                  </ul>
                </Stack>

                <Group gap="xs" style={{ flexWrap: "wrap" }}>
                  {exp.technologies.map((tech) => (
                    <Badge key={tech} variant="filled" color="blue" size="sm">
                      {tech}
                    </Badge>
                  ))}
                </Group>
              </Card>
            </Timeline.Item>
          ))}
        </Timeline>
      </Container>
    </Box>
  );
};

export default ExperienceSection;