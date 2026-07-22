import { Container, Box, rem } from "@mantine/core";
import { useState, useEffect } from "react";
import { CartProvider } from "./context/CartContext";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

const App = () => {
  const [currentPage, setCurrentPage] = useState("home");
  const [productId, setProductId] = useState(null);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) || "home";
      const [page, id] = hash.split("/");
      setCurrentPage(page);
      setProductId(id || null);
    };

    window.addEventListener("hashchange", handleHashChange);
    handleHashChange();

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <Home />;
      case "products":
        return <Products />;
      case "product":
        return productId ? <ProductDetail productId={productId} /> : <Products />;
      case "cart":
        return <Cart />;
      case "checkout":
        return <Checkout />;
      default:
        return <Home />;
    }
  };

  return (
    <CartProvider>
      <Box mih="100vh" style={{ display: "flex", flexDirection: "column" }}>
        <Navbar />
        <Box component="main" style={{ flexGrow: 1 }}>
          <Container size="xl" px={0}>
            {renderPage()}
          </Container>
        </Box>
        <Footer />
      </Box>
    </CartProvider>
  );
};

export default App;