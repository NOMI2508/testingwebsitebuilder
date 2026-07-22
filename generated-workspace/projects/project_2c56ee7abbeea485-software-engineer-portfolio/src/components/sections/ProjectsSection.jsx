import { Container, Title, Text, SimpleGrid, Group, Badge, Button, Box, Stack, Image, Modal } from "@mantine/core";
import { IconExternalLink, IconBrandGithub } from "@tabler/icons-react";
import { useState } from "react";
import { siteContent } from "../../data/siteContent";
import ProjectCard from "../common/ProjectCard";

const ProjectsSection = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [modalOpened, setModalOpened] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const categories = [
    { value: "all", label: "All Projects" },
    { value: "fullstack", label: "Full Stack" },
    { value: "frontend", label: "Frontend" },
    { value: "backend", label: "Backend" },
    { value: "mobile", label: "Mobile" },
    { value: "devops", label: "DevOps" }
  ];

  const projects = Array.isArray(siteContent?.projects) ? siteContent.projects : [];
  
  const filteredProjects = activeCategory === "all"
    ? projects
    : projects.filter(p => p?.category === activeCategory);

  const handleProjectClick = (project) => {
    setSelectedProject(project);
    setModalOpened(true);
  };

  const handleCloseModal = () => {
    setModalOpened(false);
    setSelectedProject(null);
  };

  return (
    <Box id="projects" style={{ padding: "4rem 0", backgroundColor: "var(--mantine-color-gray-1)" }}>
      <Container size="lg">
        <Stack align="center" style={{ marginBottom: "3rem" }}>
          <Title order={2} style={{ textAlign: "center", position: "relative" }}>
            Featured Projects
            <Box
              style={{
                position: "absolute",
                bottom: "-10px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "60px",
                height: "4px",
                backgroundColor: "var(--mantine-color-purple-6)",
                borderRadius: "2px"
              }}
            />
          </Title>
          <Text c="gray.6" style={{ textAlign: "center", maxWidth: "600px" }}>
            A showcase of my technical work, from web applications to infrastructure tools. Each project represents a unique challenge solved.
          </Text>
        </Stack>

        <Group justify="center" gap="xs" style={{ marginBottom: "2rem", flexWrap: "wrap" }}>
          {categories.map((cat) => (
            <Button
              key={cat.value}
              variant={activeCategory === cat.value ? "filled" : "light"}
              color={activeCategory === cat.value ? "blue" : "gray"}
              size="sm"
              onClick={() => setActiveCategory(cat.value)}
            >
              {cat.label}
            </Button>
          ))}
        </Group>

        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl">
          {filteredProjects.map((project, index) => {
            if (!project) return null;
            return (
              <Box
                key={project.id || index}
                style={{
                  transform: `translateY(${index % 2 === 0 ? "0" : "20px"})`,
                  transition: "transform 0.3s ease"
                }}
              >
                <ProjectCard project={project} onClick={() => handleProjectClick(project)} />
              </Box>
            );
          })}
        </SimpleGrid>

        <Modal
          opened={modalOpened}
          onClose={handleCloseModal}
          size="lg"
          centered
          title={selectedProject?.title || "Project Details"}
        >
          {selectedProject && (
            <Stack gap="md">
              <Image
                src={selectedProject.image}
                alt={selectedProject?.title || "Project screenshot"}
                radius="md"
                style={{ maxHeight: "300px", objectFit: "cover" }}
              />
              <Text>{selectedProject?.description || "No description available."}</Text>
              <Group gap="xs" style={{ flexWrap: "wrap" }}>
                {Array.isArray(selectedProject?.technologies) 
                  ? selectedProject.technologies.map((tech) => (
                      <Badge key={tech} variant="light" color="blue">
                        {tech}
                      </Badge>
                    ))
                  : null
                }
              </Group>
              <Group gap="sm">
                {selectedProject?.liveUrl && (
                  <Button
                    leftSection={<IconExternalLink size={16} />}
                    onClick={() => window.open(selectedProject.liveUrl, "_blank", "noopener,noreferrer")}
                  >
                    Live Demo
                  </Button>
                )}
                {selectedProject?.githubUrl && (
                  <Button
                    leftSection={<IconBrandGithub size={16} />}
                    variant="outline"
                    onClick={() => window.open(selectedProject.githubUrl, "_blank", "noopener,noreferrer")}
                  >
                    View on GitHub
                  </Button>
                )}
              </Group>
            </Stack>
          )}
        </Modal>
      </Container>
    </Box>
  );
};

export default ProjectsSection;