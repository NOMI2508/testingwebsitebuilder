import { createContext, useContext, useEffect, useState } from "react";
import { useLocalStorage, useMediaQuery } from "@mantine/hooks";

const ThemeContext = createContext({
  colorScheme: "light",
  toggleColorScheme: () => {}
});

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const systemPrefersDark = useMediaQuery("(prefers-color-scheme: dark)");
  const [storedColorScheme, setStoredColorScheme] = useLocalStorage({
    key: "mantine-color-scheme",
    defaultValue: "light",
    getInitialValueInEffect: false
  });

  const [colorScheme, setColorScheme] = useState(storedColorScheme || (systemPrefersDark ? "dark" : "light"));

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    if (colorScheme === "dark") {
      root.setAttribute("data-mantine-color-scheme", "dark");
      body.style.backgroundColor = "#111827";
      body.style.color = "#F9FAFB";
    } else {
      root.setAttribute("data-mantine-color-scheme", "light");
      body.style.backgroundColor = "#FFFFFF";
      body.style.color = "#1F2937";
    }
  }, [colorScheme]);

  const toggleColorScheme = () => {
    const newColorScheme = colorScheme === "dark" ? "light" : "dark";
    setColorScheme(newColorScheme);
    setStoredColorScheme(newColorScheme);
  };

  return (
    <ThemeContext.Provider value={{ colorScheme, toggleColorScheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;