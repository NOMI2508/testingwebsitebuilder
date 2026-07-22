import { Group, ActionIcon } from "@mantine/core";
import { IconBrandLinkedin, IconBrandGithub, IconBrandTwitter, IconMail } from "@tabler/icons-react";

const SocialLinks = ({ links, size = "lg" }) => {
  const iconSize = size === "sm" ? 18 : size === "lg" ? 22 : 20;

  const getIcon = (name) => {
    const iconMap = {
      LinkedIn: IconBrandLinkedin,
      GitHub: IconBrandGithub,
      Twitter: IconBrandTwitter,
      Email: IconMail
    };
    return iconMap[name] || IconMail;
  };

  return (
    <Group gap="sm">
      {links.map((link) => {
        const Icon = getIcon(link.name);
        return (
          <ActionIcon
            key={link.name}
            component="a"
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            size={size}
            variant="subtle"
            color="gray.7"
            style={{
              transition: "color 0.2s ease, transform 0.2s ease"
            }}
          >
            <Icon size={iconSize} />
          </ActionIcon>
        );
      })}
    </Group>
  );
};

export default SocialLinks;