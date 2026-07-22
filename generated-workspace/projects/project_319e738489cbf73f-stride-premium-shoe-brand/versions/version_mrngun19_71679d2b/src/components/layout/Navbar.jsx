import { Box, Group, Text, ActionIcon, Burger, Drawer, ScrollArea, rem } from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { IconShoppingCart, IconMenu2, IconX } from "@tabler/icons-react";
import { useCart } from "../../context/CartContext";
import siteContent from "../../data/siteContent";

const Navbar = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { getCartCount } = useCart();
  
  const navigation = Array.isArray(siteContent.navigation) ? siteContent.navigation : [];
  const brandName = siteContent.brand?.name || "Stride";
  const cartCount = typeof getCartCount === "function" ? getCartCount() : 0;

  const scrollToSection = (href) => {
    close();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const renderNavLinks = () => (
    <Group gap="xl" visibleFrom="md">
      {navigation.map((item, index) => (
        <Text
          key={index}
          component="a"
          href={item.href}
          onClick={(e) => {
            e.preventDefault();
            scrollToSection(item.href);
          }}
          style={{
            cursor: "pointer",
            textDecoration: "none",
            color: "var(--mantine-color-text)",
            fontWeight: 500,
            transition: "color 150ms ease"
          }}
          className="hover:text-slate-7"
        >
          {item.label}
        </Text>
      ))}
    </Group>
  );

  const renderMobileNav = () => (
    <Drawer
      opened={opened}
      onClose={close}
      title={brandName}
      padding="md"
      size="100%"
      hiddenFrom="md"
      closeButtonProps={{
        icon: <IconX size={rem(24)} />
      }}
    >
      <ScrollArea h="100%">
        <Group gap="md" direction="column" align="stretch">
          {navigation.map((item, index) => (
            <Text
              key={index}
              component="a"
              href={item.href}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection(item.href);
              }}
              size="lg"
              style={{
                cursor: "pointer",
                textDecoration: "none",
                padding: rem(12),
                borderRadius: rem(8),
                "&:hover": {
                  backgroundColor: "var(--mantine-color-slate-0)"
                }
              }}
            >
              {item.label}
            </Text>
          ))}
        </Group>
      </ScrollArea>
    </Drawer>
  );

  return (
    <Box
      component="nav"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid var(--mantine-color-slate-2)"
      }}
      h={64}
      px={{ base: "md", md: "xl" }}
    >
      <Group justify="space-between" h="100%" mx="auto" maw={1400}>
        <Group>
          <Burger
            opened={opened}
            onClick={open}
            hiddenFrom="md"
            size="sm"
            aria-label="Toggle navigation"
          />
          <Text
            component="a"
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("#home");
            }}
            size="xl"
            fw={700}
            style={{
              cursor: "pointer",
              textDecoration: "none",
              letterSpacing: rem(-0.5),
              color: "var(--mantine-color-slate-8)"
            }}
          >
            {brandName}
          </Text>
        </Group>

        {renderNavLinks()}

        <Group>
          <ActionIcon
            variant="subtle"
            size="lg"
            radius="xl"
            aria-label="Shopping cart"
            onClick={() => scrollToSection("#cart")}
            pos="relative"
          >
            <IconShoppingCart size={rem(22)} />
            {cartCount > 0 && (
              <Box
                style={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  width: rem(18),
                  height: rem(18),
                  borderRadius: "50%",
                  backgroundColor: "var(--mantine-color-gold-6)",
                  color: "white",
                  fontSize: rem(10),
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                {cartCount > 99 ? "99+" : cartCount}
              </Box>
            )}
          </ActionIcon>
        </Group>
      </Group>

      {renderMobileNav()}
    </Box>
  );
};

export default Navbar;