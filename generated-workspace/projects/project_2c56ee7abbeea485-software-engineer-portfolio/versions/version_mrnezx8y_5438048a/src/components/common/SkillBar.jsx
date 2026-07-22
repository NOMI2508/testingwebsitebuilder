import { useState, useEffect, useRef } from "react";
import { Group, Text, Progress, Box } from "@mantine/core";

const SkillBar = ({ skill, delay = 0 }) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setTimeout(() => {
            setAnimatedValue(skill.proficiency);
          }, delay);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [skill.proficiency, delay]);

  return (
    <Box ref={ref} style={{ marginBottom: "1rem" }}>
      <Group justify="space-between" style={{ marginBottom: "0.5rem" }}>
        <Text style={{ fontWeight: 500 }}>{skill.name}</Text>
        <Group gap="xs">
          <Text size="sm" color="gray.6">{skill.years}+ years</Text>
          <Text size="sm" weight={600} color="blue.6">{skill.proficiency}%</Text>
        </Group>
      </Group>
      <Progress
        value={animatedValue}
        color="blue"
        size="lg"
        radius="xl"
        animated={isVisible}
        style={{
          transition: "width 0.5s ease-out"
        }}
      />
    </Box>
  );
};

export default SkillBar;