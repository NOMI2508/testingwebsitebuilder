import { CartProvider } from "./context/CartContext";
import AppRouter from "./routes/AppRouter";

const App = () => {
  return (
    <CartProvider>
      <AppRouter />
    </CartProvider>
  );
};

export default App;