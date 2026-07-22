import { Container, Title, Text, Button, Group, Avatar, Box, Stack } from "@mantine/core";
import { IconArrowDown, IconMail } from "@tabler/icons-react";
import { smoothScrollTo } from "../../lib/smoothScroll";
import { siteContent } from "../../data/siteContent";

const HeroSection = () => {
  const handleViewWork = () => {
    smoothScrollTo("projects");
  };

  const handleContact = () => {
    smoothScrollTo("contact");
  };

  return (
    <Box
      id="hero"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        background: "linear-gradient(135deg, #EFF6FF 0%, #F5F3FF 100%)",
        position: "relative",
        overflow: "hidden"
      }}
    >
      <Container size="lg" style={{ paddingTop: "4rem", paddingBottom: "4rem" }}>
        <Stack
          align="center"
          gap="xl"
          style={{ textAlign: "center", maxWidth: "800px", margin: "0 auto" }}
        >
          <Avatar
            src={siteContent.personal.avatar}
            alt={siteContent.personal.name}
            size={180}
            radius="50%"
            style={{
              border: "4px solid #3B82F6",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
            }}
          />

          <Stack gap="md" style={{ maxWidth: "600px" }}>
            <Title
              order={1}
              style={{
                fontSize: "clamp(2.5rem, 5vw, 4rem)",
                fontWeight: 800,
                letterSpacing: "-0.02em",
                lineHeight: 1.1
              }}
            >
              {siteContent.personal.name}
            </Title>

            <Text
              size="xl"
              color="blue.6"
              style={{ fontWeight: 600, fontSize: "1.5rem" }}
            >
              {siteContent.personal.title}
            </Text>

            <Text
              size="lg"
              color="gray.7"
              style={{ lineHeight: 1.6, maxWidth: "540px", margin: "0 auto" }}
            >
              {siteContent.personal.tagline}
            </Text>
          </Stack>

          <Group gap="lg" style={{ marginTop: "1rem" }}>
            <Button
              size="lg"
              onClick={handleViewWork}
              rightSection={<IconArrowDown size={20} />}
              style={{
                background: "linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)",
                border: "none"
              }}
            >
              View My Work
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={handleContact}
              leftSection={<IconMail size={20} />}
            >
              Contact Me
            </Button>
          </Group>
        </Stack>
      </Container>

      <Box
        style={{
          position: "absolute",
          bottom: "2rem",
          left: "50%",
          transform: "translateX(-50%)",
          animation: "bounce 2s infinite"
        }}
      >
        <IconArrowDown size={32} color="#9CA3AF" />
      </Box>

      <style>
        {`
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateX(-50%) translateY(0); }
            40% { transform: translateX(-50%) translateY(-10px); }
            60% { transform: translateX(-50%) translateY(-5px); }
          }
        `}
      </style>
    </Box>
  );
};

export default HeroSection;