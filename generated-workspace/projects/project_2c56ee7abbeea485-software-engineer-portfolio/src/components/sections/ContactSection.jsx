import { Container, Title, Text, Card, Group, TextInput, Textarea, Button, Box, Stack, Alert, Grid, useMantineTheme } from "@mantine/core";
import { IconMail, IconSend, IconCheck, IconX } from "@tabler/icons-react";
import { useState } from "react";
import { validateContactForm } from "../../lib/validateEmail";
import { siteContent } from "../../data/siteContent";
import SocialLinks from "../common/SocialLinks";

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const theme = useMantineTheme();

  const handleChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    });
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: null
      });
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const validation = validateContactForm(formData);
    
    if (validation.isValid) {
      setSubmitted(true);
      setFormData({ name: "", email: "", message: "" });
      setTimeout(() => setSubmitted(false), 5000);
    } else {
      setErrors(validation.errors);
    }
  };

  return (
    <Box id="contact" style={{ padding: "4rem 0", backgroundColor: "var(--mantine-color-gray-0)" }}>
      <Container size="lg">
        <Stack align="center" style={{ marginBottom: "3rem" }}>
          <Title order={2} style={{ textAlign: "center", position: "relative" }}>
            Get In Touch
            <Box
              style={{
                position: "absolute",
                bottom: "-10px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "60px",
                height: "4px",
                backgroundColor: "var(--mantine-color-green-6)",
                borderRadius: "2px"
              }}
            />
          </Title>
          <Text color="gray.6" style={{ textAlign: "center", maxWidth: "600px" }}>
            Have a question, opportunity, or just want to say hello? I'd love to hear from you.
          </Text>
        </Stack>

        <Grid gutter="xl">
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card shadow="sm" padding="xl" style={{ height: "100%" }}>
              <Stack gap="lg">
                <div>
                  <Text style={{ fontWeight: 600, fontSize: "1.25rem", marginBottom: "0.5rem" }}>
                    Contact Information
                  </Text>
                  <Text color="gray.6">
                    {siteContent.contact.availability}
                  </Text>
                  <Text size="sm" color="gray.6">
                    {siteContent.contact.responseTime}
                  </Text>
                </div>

                <Stack gap="md">
                  <Group gap="sm">
                    <IconMail size={20} color="var(--mantine-color-blue-6)" />
                    <Text>{siteContent.personal.email}</Text>
                  </Group>
                </Stack>

                <Box style={{ marginTop: "auto" }}>
                  <Text style={{ fontWeight: 500, marginBottom: "0.5rem" }}>
                    Connect with me:
                  </Text>
                  <SocialLinks links={siteContent.socialLinks} />
                </Box>
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card shadow="sm" padding="xl">
              {submitted ? (
                <Alert
                  icon={<IconCheck size={16} />}
                  title="Message Sent!"
                  color="green"
                  variant="light"
                >
                  Thank you for reaching out. I'll get back to you within 24 hours.
                </Alert>
              ) : (
                <form onSubmit={handleSubmit}>
                  <Stack gap="md">
                    <TextInput
                      label="Name"
                      placeholder="Your name"
                      required
                      value={formData.name}
                      onChange={handleChange("name")}
                      error={errors.name}
                    />

                    <TextInput
                      label="Email"
                      placeholder="your@email.com"
                      required
                      type="email"
                      value={formData.email}
                      onChange={handleChange("email")}
                      error={errors.email}
                    />

                    <Textarea
                      label="Message"
                      placeholder="What would you like to discuss?"
                      required
                      minRows={4}
                      value={formData.message}
                      onChange={handleChange("message")}
                      error={errors.message}
                    />

                    <Button
                      type="submit"
                      leftSection={<IconSend size={16} />}
                      fullWidth
                      size="lg"
                    >
                      Send Message
                    </Button>
                  </Stack>
                </form>
              )}
            </Card>
          </Grid.Col>
        </Grid>
      </Container>
    </Box>
  );
};

export default ContactSection;