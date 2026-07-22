import { Container, Title, Text, Grid, TextInput, Textarea, Button, Group, Box, Alert } from "@mantine/core";
import { useDisclosure, useInputState } from "@mantine/hooks";
import { IconCheck, IconX } from "@tabler/icons-react";
import siteContent from "../../data/siteContent";
import validateContactForm from "../../lib/validateContactForm";

const ContactSection = () => {
  const [name, setName] = useInputState("");
  const [email, setEmail] = useInputState("");
  const [message, setMessage] = useInputState("");
  const [errors, setErrors] = useDisclosure({});
  const [submitted, setSubmitted] = useDisclosure(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateContactForm({ name, email, message });
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setSubmitted(true);
      setName("");
      setEmail("");
      setMessage("");
    }
  };

  return (
    <Box
      id="contact"
      style={{
        backgroundColor: "var(--mantine-color-cream-0)",
        padding: "4rem 0"
      }}
    >
      <Container size="lg">
        <Title
          order={2}
          align="center"
          mb="xl"
          color="coffeeBrown.7"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Get in Touch
        </Title>

        <Grid gutter="xl">
          <Grid.Col span={6} breakpoints={[{ maxWidth: "48rem", span: 12 }]}>
            <Box component="form" onSubmit={handleSubmit}>
              {submitted && (
                <Alert
                  icon={<IconCheck size={16} />}
                  title="Thank you!"
                  color="green"
                  mb="md"
                >
                  Your message has been sent. We'll get back to you soon!
                </Alert>
              )}

              <TextInput
                label="Name"
                placeholder="Your name"
                value={name}
                onChange={setName}
                error={errors.name}
                required
                mb="md"
                styles={{
                  label: { color: "var(--mantine-color-coffeeBrown-7)" },
                  input: {
                    borderColor: "var(--mantine-color-coffeeBrown-4)",
                    "&:focus": {
                      borderColor: "var(--mantine-color-coffeeBrown-6)"
                    }
                  }
                }}
              />

              <TextInput
                label="Email"
                placeholder="your@email.com"
                value={email}
                onChange={setEmail}
                error={errors.email}
                required
                mb="md"
                styles={{
                  label: { color: "var(--mantine-color-coffeeBrown-7)" },
                  input: {
                    borderColor: "var(--mantine-color-coffeeBrown-4)",
                    "&:focus": {
                      borderColor: "var(--mantine-color-coffeeBrown-6)"
                    }
                  }
                }}
              />

              <Textarea
                label="Message"
                placeholder="How can we help you?"
                value={message}
                onChange={setMessage}
                error={errors.message}
                required
                minRows={4}
                mb="md"
                styles={{
                  label: { color: "var(--mantine-color-coffeeBrown-7)" },
                  input: {
                    borderColor: "var(--mantine-color-coffeeBrown-4)",
                    "&:focus": {
                      borderColor: "var(--mantine-color-coffeeBrown-6)"
                    }
                  }
                }}
              />

              <Button type="submit" fullWidth>
                Send Message
              </Button>
            </Box>
          </Grid.Col>

          <Grid.Col span={6} breakpoints={[{ maxWidth: "48rem", span: 12 }]}>
            <Box>
              <Title order={3} mb="lg" color="coffeeBrown.7">
                Visit Us
              </Title>

              <Text color="coffeeBrown.6" mb="md">
                <strong>Address:</strong>
                <br />
                {siteContent.contact.address}
              </Text>

              <Text color="coffeeBrown.6" mb="md">
                <strong>Phone:</strong>
                <br />
                {siteContent.contact.phone}
              </Text>

              <Text color="coffeeBrown.6" mb="md">
                <strong>Email:</strong>
                <br />
                {siteContent.contact.email}
              </Text>

              <Title order={4} mt="lg" mb="sm" color="coffeeBrown.7">
                Hours
              </Title>

              {siteContent.contact.hours.map((hour, index) => (
                <Group key={index} position="apart" mb="xs">
                  <Text color="coffeeBrown.6">{hour.day}</Text>
                  <Text color="coffeeBrown.6">{hour.time}</Text>
                </Group>
              ))}

              <Title order={4} mt="lg" mb="sm" color="coffeeBrown.7">
                Follow Us
              </Title>

              <Group spacing="xs">
                <Text color="coffeeBrown.6">Instagram:</Text>
                <Text color="coffeeBrown.7">{siteContent.contact.socialMedia.instagram}</Text>
              </Group>
              <Group spacing="xs">
                <Text color="coffeeBrown.6">Facebook:</Text>
                <Text color="coffeeBrown.7">{siteContent.contact.socialMedia.facebook}</Text>
              </Group>
              <Group spacing="xs">
                <Text color="coffeeBrown.6">Twitter:</Text>
                <Text color="coffeeBrown.7">{siteContent.contact.socialMedia.twitter}</Text>
              </Group>
            </Box>
          </Grid.Col>
        </Grid>
      </Container>
    </Box>
  );
};

export default ContactSection;