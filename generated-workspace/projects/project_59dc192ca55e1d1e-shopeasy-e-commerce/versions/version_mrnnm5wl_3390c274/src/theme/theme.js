import { createTheme } from "@mantine/core";

const siteTheme = createTheme({
  colors: {
    brand: [
      "#eff6ff",
      "#dbeafe",
      "#bfdbfe",
      "#93c5fd",
      "#60a5fa",
      "#3b82f6",
      "#2563eb",
      "#1d4ed8",
      "#2563eb",
      "#1e40af",
    ],
    success: [
      "#ecfdf5",
      "#d1fae5",
      "#a7f3d0",
      "#6ee7b7",
      "#34d399",
      "#10b981",
      "#059669",
      "#047857",
      "#065f46",
      "#064e3b",
    ],
    warning: [
      "#fffbeb",
      "#fef3c7",
      "#fde68a",
      "#fcd34d",
      "#fbbf24",
      "#f59e0b",
      "#d97706",
      "#b45309",
      "#92400e",
      "#7c2d12",
    ],
    error: [
      "#fef2f2",
      "#fee2e2",
      "#fecaca",
      "#fca5a5",
      "#f87171",
      "#ef4444",
      "#dc2626",
      "#b91c1c",
      "#991b1b",
      "#7f1d1d",
    ],
  },
  primaryColor: "brand",
  primaryShade: 6,
  defaultColorScheme: "light",
  fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  fontSizes: {
    xs: "0.75rem",
    sm: "0.875rem",
    md: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
  },
  lineHeights: {
    xs: "1.5",
    sm: "1.55",
    md: "1.6",
    lg: "1.65",
    xl: "1.7",
  },
  spacing: {
    xs: "0.5rem",
    sm: "0.75rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    "2xl": "3rem",
    "3xl": "4rem",
  },
  radius: {
    xs: "0.25rem",
    sm: "0.375rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
  },
  shadows: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    md: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
  },
  components: {
    Button: {
      defaultProps: {
        radius: "md",
        fontWeight: 500,
      },
      styles: {
        root: {
          transition: "all 150ms ease",
        },
      },
    },
    Card: {
      defaultProps: {
        radius: "lg",
        shadow: "sm",
        padding: "lg",
      },
      styles: {
        root: {
          transition: "box-shadow 150ms ease, transform 150ms ease",
          "&:hover": {
            boxShadow: "var(--mantine-shadow-md)",
          },
        },
      },
    },
    Input: {
      defaultProps: {
        radius: "md",
      },
    },
    Drawer: {
      defaultProps: {
        radius: 0,
        padding: 0,
      },
    },
    Badge: {
      defaultProps: {
        radius: "sm",
        fontWeight: 500,
      },
    },
    Divider: {
      defaultProps: {
        margin: "lg",
      },
    },
  },
});

export default siteTheme;