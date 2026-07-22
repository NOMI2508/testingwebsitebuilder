import { Outlet } from "react-router-dom";
import { useDisclosure } from "@mantine/hooks";
import Header from "./Header";
import CartDrawer from "../cart/CartDrawer";

const StoreLayout = () => {
  const [cartOpened, { open: openCart, close: closeCart }] = useDisclosure(false);

  const handleSearch = (query) => {
    // Search is handled by the page components
  };

  return (
    <>
      <Header onSearch={handleSearch} onCartClick={openCart} />
      <Outlet />
      <CartDrawer opened={cartOpened} onClose={closeCart} />
    </>
  );
};

export default StoreLayout;