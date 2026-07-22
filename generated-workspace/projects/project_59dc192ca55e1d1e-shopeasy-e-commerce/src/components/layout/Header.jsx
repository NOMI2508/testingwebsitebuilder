import { Group, ActionIcon, Text, Indicator, Box, Container, rem } from "@mantine/core";
import { IconShoppingCart, IconMenu2 } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import SearchBar from "../common/SearchBar";
import { useDisclosure } from "@mantine/hooks";

const Header = ({ onSearch, onCartClick }) => {
  const { getCartItemCount } = useCart();
  const itemCount = getCartItemCount();

  return (
    <Box
      component="header"
      style={{
        borderBottom: "1px solid var(--mantine-color-gray-3)",
        backgroundColor: "var(--mantine-color-white)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <Container size="xl" h={60}>
        <Group position="apart" h="100%">
          <Group spacing="md">
            <Link
              to="/"
              style={{
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <Text
                size="xl"
                weight={700}
                c="brand"
                style={{ cursor: "pointer" }}
              >
                ShopEasy
              </Text>
            </Link>
          </Group>

          <Box
            style={{
              flex: 1,
              maxWidth: rem(500),
              margin: "0 auto",
            }}
          >
            <SearchBar onSearch={onSearch} />
          </Box>

          <Group spacing="sm">
            <Indicator
              inline
              label={itemCount}
              size={16}
              disabled={itemCount === 0}
              styles={{
                indicator: {
                  fontSize: "var(--mantine-font-size-xs)",
                  fontWeight: 600,
                },
              }}
            >
              <ActionIcon
                variant="subtle"
                color="gray"
                size="lg"
                onClick={onCartClick}
                aria-label="Open cart"
              >
                <IconShoppingCart size={22} />
              </ActionIcon>
            </Indicator>
          </Group>
        </Group>
      </Container>
    </Box>
  );
};

export default Header;