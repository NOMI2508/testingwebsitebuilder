import { IconBrandReact, IconBrandJavascript, IconBrandTypescript, IconBrandNodejs, IconBrandPython, IconBrandDocker, IconBrandAws, IconBrandGit, IconBrandMongodb, IconBrandMysql, IconBrandFigma, IconCode, IconServer, IconCloud, IconTools, IconMail, IconMapPin, IconPhone, IconBrandLinkedin, IconBrandGithub, IconBrandTwitter, IconBrandYoutube } from "@tabler/icons-react";

export const siteContent = {
  personal: {
    name: "Alex Chen",
    title: "Senior Software Engineer",
    tagline: "Building scalable web applications with modern technologies. Passionate about clean code, user experience, and solving complex problems.",
    email: "alex.chen@example.com",
    location: "San Francisco, CA",
    phone: "+1 (555) 123-4567",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1df3dca362?w=400&h=400&fit=crop&crop=face",
    resumeUrl: "/resume-alex-chen.pdf"
  },
  navigation: [
    { id: "hero", label: "Home", href: "#hero" },
    { id: "about", label: "About", href: "#about" },
    { id: "skills", label: "Skills", href: "#skills" },
    { id: "experience", label: "Experience", href: "#experience" },
    { id: "projects", label: "Projects", href: "#projects" },
    { id: "contact", label: "Contact", href: "#contact" }
  ],
  socialLinks: [
    { name: "LinkedIn", url: "https://linkedin.com/in/alexchen", icon: IconBrandLinkedin },
    { name: "GitHub", url: "https://github.com/alexchen", icon: IconBrandGithub },
    { name: "Twitter", url: "https://twitter.com/alexchen", icon: IconBrandTwitter }
  ],
  about: {
    bio: [
      "I'm a full-stack software engineer with over 8 years of experience building web applications that scale. My journey started with frontend development, crafting intuitive user interfaces, and evolved into architecting robust backend systems and cloud infrastructure.",
      "I specialize in JavaScript ecosystems, particularly React and Node.js, but I'm always exploring new technologies. When I'm not coding, you'll find me contributing to open-source projects, writing technical articles, or mentoring junior developers.",
      "My approach combines technical excellence with business understanding. I believe great software solves real problems elegantly, and I'm passionate about creating solutions that make a meaningful impact."
    ],
    highlights: [
      "8+ years of professional development experience",
      "Led teams of 5-10 engineers on major projects",
      "Contributed to 15+ open-source repositories",
      "Built applications serving 1M+ users monthly",
      "AWS Certified Solutions Architect"
    ]
  },
  skills: {
    categories: {
      frontend: {
        label: "Frontend",
        icon: IconCode,
        skills: [
          { name: "React", proficiency: 95, years: 6 },
          { name: "JavaScript", proficiency: 98, years: 8 },
          { name: "TypeScript", proficiency: 90, years: 4 },
          { name: "HTML/CSS", proficiency: 95, years: 8 },
          { name: "Next.js", proficiency: 85, years: 3 },
          { name: "Vue.js", proficiency: 75, years: 2 }
        ]
      },
      backend: {
        label: "Backend",
        icon: IconServer,
        skills: [
          { name: "Node.js", proficiency: 92, years: 6 },
          { name: "Python", proficiency: 88, years: 5 },
          { name: "Express", proficiency: 90, years: 5 },
          { name: "GraphQL", proficiency: 82, years: 3 },
          { name: "REST APIs", proficiency: 95, years: 7 }
        ]
      },
      devops: {
        label: "DevOps",
        icon: IconCloud,
        skills: [
          { name: "AWS", proficiency: 88, years: 4 },
          { name: "Docker", proficiency: 90, years: 5 },
          { name: "CI/CD", proficiency: 85, years: 4 },
          { name: "Kubernetes", proficiency: 75, years: 2 },
          { name: "Terraform", proficiency: 70, years: 2 }
        ]
      },
      tools: {
        label: "Tools",
        icon: IconTools,
        skills: [
          { name: "Git", proficiency: 95, years: 8 },
          { name: "Figma", proficiency: 80, years: 3 },
          { name: "Jest", proficiency: 85, years: 4 },
          { name: "Webpack", proficiency: 82, years: 4 },
          { name: "MongoDB", proficiency: 88, years: 5 },
          { name: "MySQL", proficiency: 90, years: 6 }
        ]
      }
    }
  },
  experience: [
    {
      id: 1,
      company: "TechCorp Solutions",
      companyLogo: "https://images.unsplash.com/photo-1560185127-6ebb3a87138b?w=100&h=100&fit=crop",
      title: "Senior Software Engineer",
      startDate: "2021-03",
      endDate: null,
      location: "San Francisco, CA",
      responsibilities: [
        "Lead development of customer-facing web applications serving 500K+ monthly users",
        "Architect and implement microservices infrastructure on AWS",
        "Mentor junior developers and conduct code reviews",
        "Collaborate with product and design teams to define technical requirements"
      ],
      achievements: [
        "Reduced application load time by 40% through performance optimizations",
        "Led migration from monolith to microservices, improving scalability",
        "Implemented CI/CD pipeline reducing deployment time from 2 hours to 15 minutes"
      ],
      technologies: ["React", "Node.js", "AWS", "Docker", "GraphQL", "TypeScript"]
    },
    {
      id: 2,
      company: "InnovateSoft Inc",
      companyLogo: "https://images.unsplash.com/photo-1559136658-1726b71a8b81?w=100&h=100&fit=crop",
      title: "Full Stack Developer",
      startDate: "2018-06",
      endDate: "2021-02",
      location: "Seattle, WA",
      responsibilities: [
        "Developed and maintained e-commerce platform with 100K+ products",
        "Built responsive frontend components using React and Redux",
        "Created RESTful APIs and integrated third-party payment systems",
        "Worked closely with UX designers to implement pixel-perfect interfaces"
      ],
      achievements: [
        "Increased conversion rate by 25% through A/B testing and optimization",
        "Reduced server costs by 30% through database query optimization",
        "Implemented automated testing suite achieving 85% code coverage"
      ],
      technologies: ["React", "Redux", "Node.js", "MongoDB", "Express", "AWS Lambda"]
    },
    {
      id: 3,
      company: "StartupLaunch",
      companyLogo: "https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100&h=100&fit=crop",
      title: "Frontend Developer",
      startDate: "2016-01",
      endDate: "2018-05",
      location: "Remote",
      responsibilities: [
        "Built responsive web applications for early-stage startups",
        "Collaborated with designers to create engaging user experiences",
        "Implemented modern CSS frameworks and build tools",
        "Maintained code quality through testing and documentation"
      ],
      achievements: [
        "Delivered 12+ MVP products for startup clients",
        "Created reusable component library adopted across projects",
        "Reduced development time by 40% through tooling improvements"
      ],
      technologies: ["JavaScript", "HTML/CSS", "Vue.js", "Webpack", "Sass"]
    }
  ],
  projects: [
    {
      id: 1,
      title: "E-Commerce Analytics Dashboard",
      description: "A comprehensive analytics platform for e-commerce businesses with real-time data visualization, inventory management, and sales forecasting capabilities.",
      image: "https://images.unsplash.com/photo-1551288043-7a1d9e0b8c4c?w=600&h=400&fit=crop",
      technologies: ["React", "Node.js", "MongoDB", "D3.js", "AWS"],
      liveUrl: "https://demo-ecommerce-dashboard.com",
      githubUrl: "https://github.com/alexchen/ecommerce-dashboard",
      category: "fullstack",
      featured: true
    },
    {
      id: 2,
      title: "Task Management Mobile App",
      description: "Cross-platform mobile application for team collaboration with real-time updates, offline support, and intuitive drag-and-drop interface.",
      image: "https://images.unsplash.com/photo-1512941937669-aa5f6cf2f999?w=600&h=400&fit=crop",
      technologies: ["React Native", "Firebase", "Redux", "TypeScript"],
      liveUrl: "https://taskapp-demo.com",
      githubUrl: "https://github.com/alexchen/task-management-app",
      category: "mobile",
      featured: true
    },
    {
      id: 3,
      title: "API Gateway Service",
      description: "Microservices gateway with rate limiting, authentication, and request routing. Built for high-throughput applications with comprehensive logging and monitoring.",
      image: "https://images.unsplash.com/photo-1558494977-07e0b9b7b7b7?w=600&h=400&fit=crop",
      technologies: ["Node.js", "Express", "Docker", "Redis", "Kubernetes"],
      liveUrl: null,
      githubUrl: "https://github.com/alexchen/api-gateway",
      category: "backend",
      featured: false
    },
    {
      id: 4,
      title: "Design System Component Library",
      description: "Open-source React component library with 50+ accessible components, comprehensive documentation, and Storybook integration.",
      image: "https://images.unsplash.com/photo-1507238697404-9c6b6c1c7b7b?w=600&h=400&fit=crop",
      technologies: ["React", "TypeScript", "Storybook", "Jest", "Rollup"],
      liveUrl: "https://design-system-demo.com",
      githubUrl: "https://github.com/alexchen/react-design-system",
      category: "frontend",
      featured: false
    },
    {
      id: 5,
      title: "Real-time Chat Application",
      description: "WebSocket-based chat application with end-to-end encryption, file sharing, and group chat functionality. Supports 10K+ concurrent users.",
      image: "https://images.unsplash.com/photo-1577565703870-4a5a3a3a3a3a?w=600&h=400&fit=crop",
      technologies: ["React", "Socket.io", "Node.js", "MongoDB", "Docker"],
      liveUrl: "https://chat-demo.com",
      githubUrl: "https://github.com/alexchen/realtime-chat",
      category: "fullstack",
      featured: false
    },
    {
      id: 6,
      title: "DevOps Automation Toolkit",
      description: "CLI tool for automating cloud infrastructure deployment with Terraform, including pre-built templates for common architectures.",
      image: "https://images.unsplash.com/photo-1607748882511-8a7c5e5e5e5e?w=600&h=400&fit=crop",
      technologies: ["Go", "Terraform", "AWS", "Docker", "CLI"],
      liveUrl: null,
      githubUrl: "https://github.com/alexchen/devops-toolkit",
      category: "devops",
      featured: false
    }
  ],
  contact: {
    availability: "Available for new opportunities",
    responseTime: "Typically responds within 24 hours"
  }
};