import { createTheme } from "@mantine/core";

const siteTheme = createTheme({
  colors: {
    primary: [
      "#EEF2FF",
      "#E0E7FF",
      "#C7D2FE",
      "#A5B4FC",
      "#818CF8",
      "#6366F1",
      "#4F46E5",
      "#4338CA",
      "#3730A3",
      "#312E8A",
    ],
    secondary: [
      "#ECFDF5",
      "#D1FAE5",
      "#A7F3D0",
      "#76E4B5",
      "#4ADE80",
      "#22C55E",
      "#16A34A",
      "#15803D",
      "#166534",
      "#14532D",
    ],
  },
  primaryColor: "primary",
  primaryShade: 6,
  defaultColorScheme: "light",
  fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  headings: {
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    fontWeight: 600,
  },
  components: {
    Card: {
      defaultProps: {
        shadow: "sm",
        padding: "md",
        radius: "md",
        withBorder: true,
      },
      styles: {
        root: {
          transition: "box-shadow 150ms ease, transform 150ms ease",
        },
      },
    },
    Button: {
      defaultProps: {
        radius: "md",
      },
    },
    Badge: {
      defaultProps: {
        radius: "xl",
        size: "sm",
      },
      styles: {
        root: {
          textTransform: "capitalize",
        },
      },
    },
    Table: {
      defaultProps: {
        highlightOnHover: true,
        striped: true,
      },
    },
    AppShell: {
      defaultProps: {
        header: { height: 60 },
        navbar: { width: { base: 260 }, breakpoint: "sm" },
        padding: 0,
      },
    },
  },
});

export default siteTheme;