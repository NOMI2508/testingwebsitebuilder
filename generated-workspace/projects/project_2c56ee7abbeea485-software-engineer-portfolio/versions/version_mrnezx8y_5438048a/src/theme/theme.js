import { createTheme } from "@mantine/core";

export const siteTheme = createTheme({
  primaryColor: "blue",
  colors: {
    blue: [
      "#EFF6FF",
      "#DBEAFE",
      "#BFDBFE",
      "#93C5FD",
      "#60A5FA",
      "#3B82F6",
      "#2563EB",
      "#1D4ED8",
      "#1E40AF",
      "#1E3A8A"
    ],
    purple: [
      "#F5F3FF",
      "#EDE9FE",
      "#DDD6FE",
      "#C4B5FD",
      "#A78BFA",
      "#8B5CF6",
      "#7C3AED",
      "#6D28D9",
      "#5B21B6",
      "#4C1D95"
    ],
    green: [
      "#ECFDF5",
      "#D1FAE5",
      "#A7F3D0",
      "#71FBBD",
      "#34D399",
      "#10B981",
      "#059669",
      "#047857",
      "#065F46",
      "#064E3B"
    ]
  },
  primaryShade: 6,
  defaultColorScheme: "light",
  fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  fontFamilyMonospace: "Fira Code, 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace",
  headings: {
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontWeight: "700",
    sizes: {
      h1: { fontSize: "3.5rem", lineHeight: "1.2", fontWeight: "800" },
      h2: { fontSize: "2.5rem", lineHeight: "1.3", fontWeight: "700" },
      h3: { fontSize: "2rem", lineHeight: "1.4", fontWeight: "600" },
      h4: { fontSize: "1.5rem", lineHeight: "1.4", fontWeight: "600" },
      h5: { fontSize: "1.25rem", lineHeight: "1.5", fontWeight: "500" },
      h6: { fontSize: "1rem", lineHeight: "1.5", fontWeight: "500" }
    }
  },
  radius: {
    xs: "4px",
    sm: "6px",
    md: "8px",
    lg: "12px",
    xl: "16px"
  },
  shadows: {
    xs: "0 1px 2px rgba(0, 0, 0, 0.05)",
    sm: "0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.08)",
    md: "0 4px 6px rgba(0, 0, 0, 0.13), 0 1px 3px rgba(0, 0, 0, 0.1)",
    lg: "0 10px 15px rgba(0, 0, 0, 0.13), 0 4px 6px rgba(0, 0, 0, 0.1)",
    xl: "0 20px 25px rgba(0, 0, 0, 0.15), 0 10px 10px rgba(0, 0, 0, 0.08)"
  },
  spacing: {
    xs: "0.5rem",
    sm: "0.75rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    xxl: "3rem"
  },
  components: {
    Button: {
      defaultProps: {
        radius: "md",
        variant: "filled"
      },
      styles: {
        root: {
          transition: "all 0.2s ease",
          fontWeight: 500
        }
      }
    },
    Card: {
      defaultProps: {
        radius: "lg",
        shadow: "sm"
      },
      styles: {
        root: {
          transition: "transform 0.2s ease, box-shadow 0.2s ease"
        }
      }
    },
    Progress: {
      defaultProps: {
        size: "lg",
        radius: "xl"
      }
    },
    Timeline: {
      defaultProps: {
        bulletSize: 20,
        lineWidth: 2,
        styles: {
          item: {
            transition: "transform 0.2s ease"
          }
        }
      }
    },
    Container: {
      defaultProps: {
        sizes: {
          xs: 540,
          sm: 720,
          md: 960,
          lg: 1140,
          xl: 1320
        }
      }
    }
  }
});

export default siteTheme;