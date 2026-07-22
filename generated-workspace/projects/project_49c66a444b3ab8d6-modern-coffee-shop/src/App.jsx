import { Box } from "@mantine/core";
import Navbar from "./components/layout/Navbar";
import HeroSection from "./components/sections/HeroSection";
import MenuSection from "./components/sections/MenuSection";
import ContactSection from "./components/sections/ContactSection";
import Footer from "./components/layout/Footer";

const App = () => {
  return (
    <Box style={{ minHeight: "100vh", backgroundColor: "var(--mantine-color-cream-0)" }}>
      <Navbar />
      <HeroSection />
      <MenuSection />
      <ContactSection />
      <Footer />
    </Box>
  );
};

export default App;