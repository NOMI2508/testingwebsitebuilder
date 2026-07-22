import { createTheme } from "@mantine/core";

const siteTheme = createTheme({
  primaryColor: "slate",
  colors: {
    slate: [
      "#f8fafc",
      "#f1f5f9",
      "#e2e8f0",
      "#cbd5e1",
      "#94a3b8",
      "#64748b",
      "#475569",
      "#334155",
      "#1e293b",
      "#0f172a"
    ],
    taupe: [
      "#fafaf9",
      "#f5f5f4",
      "#e7e5e4",
      "#d6d3d1",
      "#a8a29e",
      "#78716c",
      "#57534e",
      "#44403c",
      "#292524",
      "#1c1917"
    ],
    gold: [
      "#fefdf9",
      "#fdf6e3",
      "#fae7a0",
      "#f7d96b",
      "#f0c543",
      "#d4af37",
      "#b8962f",
      "#9c7c27",
      "#80631f",
      "#644a17"
    ]
  },
  primaryShade: 7,
  defaultRadius: "md",
  components: {
    Button: {
      defaultProps: {
        color: "slate",
        radius: "md",
        fw: 500
      },
      styles: {
        root: {
          transition: "all 150ms ease"
        }
      }
    },
    Card: {
      defaultProps: {
        radius: "md",
        shadow: "sm"
      }
    },
    Badge: {
      defaultProps: {
        radius: "sm",
        fw: 500
      }
    },
    TextInput: {
      defaultProps: {
        radius: "sm",
        size: "md"
      }
    },
    Select: {
      defaultProps: {
        radius: "sm"
      }
    },
    Slider: {
      defaultProps: {
        color: "gold"
      }
    }
  }
});

export default siteTheme;