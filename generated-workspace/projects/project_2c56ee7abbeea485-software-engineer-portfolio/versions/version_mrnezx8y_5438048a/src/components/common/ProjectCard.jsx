import { Card, Image, Text, Group, Badge, Button, Stack } from "@mantine/core";
import { IconExternalLink, IconBrandGithub } from "@tabler/icons-react";

const ProjectCard = ({ project }) => {
  const handleExternalLink = (url) => {
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <Card
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.2s ease, box-shadow 0.2s ease"
      }}
    >
      <Card.Section>
        <Image
          src={project.image}
          alt={project.title}
          height={200}
          style={{
            objectFit: "cover",
            borderTopLeftRadius: "var(--mantine-radius-lg)",
            borderTopRightRadius: "var(--mantine-radius-lg)"
          }}
        />
      </Card.Section>

      <Stack gap="sm" style={{ flex: 1, padding: "1rem" }}>
        <Text style={{ fontWeight: 600, fontSize: "1.25rem" }}>{project.title}</Text>
        
        <Text size="sm" c="gray.6" lineClamp={3}>
          {project.description}
        </Text>

        <Group gap="xs" style={{ flexWrap: "wrap" }}>
          {project.technologies.map((tech) => (
            <Badge
              key={tech}
              variant="light"
              color="blue"
              size="sm"
            >
              {tech}
            </Badge>
          ))}
        </Group>
      </Stack>

      <Group gap="sm" style={{ padding: "0 1rem 1rem" }}>
        {project.liveUrl && (
          <Button
            leftSection={<IconExternalLink size={16} />}
            variant="filled"
            size="sm"
            onClick={() => handleExternalLink(project.liveUrl)}
          >
            Live Demo
          </Button>
        )}
        
        {project.githubUrl && (
          <Button
            leftSection={<IconBrandGithub size={16} />}
            variant="outline"
            size="sm"
            onClick={() => handleExternalLink(project.githubUrl)}
          >
            GitHub
          </Button>
        )}
      </Group>
    </Card>
  );
};

export default ProjectCard;