import { Container, Group, Text, TextInput, Button, rem, Paper } from "@mantine/core";
import { IconMail } from "@tabler/icons-react";
import { useState } from "react";
import siteContent from "../../data/siteContent";

const NewsletterSignup = () => {
  const newsletter = siteContent?.newsletter || {};
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setSubmitted(true);
    setEmail("");

    // Reset success message after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
    }, 3000);
  };

  return (
    <Container size="lg" py={64} id="newsletter">
      <Paper p={48} radius="md" shadow="sm" style={{ backgroundColor: "#f8fafc" }}>
        <Group justify="center" mb="lg">
          <Text size="32px" fw={700} c="dark" ta="center">
            {newsletter?.title || "Join the Movement"}
          </Text>
        </Group>
        <Text size="md" c="dimmed" ta="center" mb="xl" maw={500} mx="auto">
          {newsletter?.description || "Subscribe for updates on new collections and exclusive offers."}
        </Text>

        {submitted ? (
          <Group justify="center">
            <Text c="green" fw={500}>
              {newsletter?.successMessage || "Thank you for subscribing!"}
            </Text>
          </Group>
        ) : (
          <form onSubmit={handleSubmit}>
            <Group justify="center" gap="sm">
              <TextInput
                type="email"
                placeholder={newsletter?.placeholder || "Enter your email"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={error}
                required
                style={{ flex: 1, maxWidth: rem(400) }}
                leftSection={<IconMail size={rem(18)} />}
              />
              <Button type="submit" size="md">
                {newsletter?.buttonText || "Subscribe"}
              </Button>
            </Group>
          </form>
        )}
      </Paper>
    </Container>
  );
};

export default NewsletterSignup;