const theme = {
  primaryColor: "coffeeBrown",
  colors: {
    coffeeBrown: [
      "#FFF8F0",
      "#FFE8D9",
      "#FFD0B5",
      "#FFB085",
      "#CC7351",
      "#994D35",
      "#654321",
      "#4A3219",
      "#30210F",
      "#1A1208"
    ],
    cream: [
      "#FFFFFF",
      "#FFFBEF",
      "#FFFDD0",
      "#FFF9B5",
      "#FFF595",
      "#FFF175",
      "#FFED55",
      "#FFE935",
      "#FFE515",
      "#FFE100"
    ],
    terracotta: [
      "#FFF8F5",
      "#FFE8E0",
      "#FFD0C5",
      "#FFB0A0",
      "#CC7351",
      "#994D35",
      "#654321",
      "#4A3219",
      "#30210F",
      "#1A1208"
    ]
  },
  headings: {
    fontFamily: "Georgia, serif",
    fontWeight: 700
  },
  fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  components: {
    Button: {
      defaultProps: {
        color: "coffeeBrown",
        radius: "md"
      }
    },
    Card: {
      defaultProps: {
        radius: "lg",
        shadow: "sm"
      }
    },
    TextInput: {
      defaultProps: {
        radius: "md"
      }
    },
    Textarea: {
      defaultProps: {
        radius: "md"
      }
    }
  }
};

export default theme;