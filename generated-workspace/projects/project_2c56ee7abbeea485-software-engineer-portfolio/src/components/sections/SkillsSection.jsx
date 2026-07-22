import { Container, Title, Text, Tabs, Stack, Group, Box } from "@mantine/core";
import { IconCode, IconServer, IconCloud, IconTools } from "@tabler/icons-react";
import { siteContent } from "../../data/siteContent";
import SkillBar from "../common/SkillBar";

const SkillsSection = () => {
  const categories = siteContent.skills.categories;
  const categoryEntries = Object.entries(categories);

  return (
    <Box
      id="skills"
      style={{
        padding: "6rem 0",
        backgroundColor: "var(--mantine-color-gray-0)"
      }}
    >
      <Container size="lg">
        <Stack gap="xl">
          <Stack gap="xs" style={{ textAlign: "center" }}>
            <Title order={2} style={{ fontSize: "2.5rem", fontWeight: 700 }}>
              Technical Skills
            </Title>
            <Text color="gray.6" size="lg" style={{ maxWidth: "600px", margin: "0 auto" }}>
              Technologies I've mastered through years of hands-on experience
            </Text>
          </Stack>

          <Tabs
            defaultValue="frontend"
            variant="primary"
            style={{ width: "100%" }}
          >
            <Tabs.List
              style={{
                justifyContent: "center",
                marginBottom: "2rem",
                borderBottom: "1px solid var(--mantine-color-gray-3)"
              }}
            >
              {categoryEntries.map(([key, category]) => {
                const Icon = category.icon;
                return (
                  <Tabs.Tab
                    key={key}
                    value={key}
                    leftSection={<Icon size={18} />}
                    style={{
                      fontSize: "1rem",
                      fontWeight: 500,
                      padding: "1rem 1.5rem"
                    }}
                  >
                    {category.label}
                  </Tabs.Tab>
                );
              })}
            </Tabs.List>

            {categoryEntries.map(([key, category]) => (
              <Tabs.Panel key={key} value={key}>
                <Box
                  style={{
                    maxWidth: "700px",
                    margin: "0 auto",
                    padding: "1rem"
                  }}
                >
                  <Stack gap="lg">
                    {category.skills.map((skill, index) => (
                      <SkillBar
                        key={skill.name}
                        skill={skill}
                        delay={index * 100}
                      />
                    ))}
                  </Stack>
                </Box>
              </Tabs.Panel>
            ))}
          </Tabs>
        </Stack>
      </Container>
    </Box>
  );
};

export default SkillsSection;