import { Container, Grid, Loader, Center, Text, rem } from "@mantine/core";
import { useState, useEffect } from "react";
import { useDisclosure } from "@mantine/hooks";
import { useCart } from "../context/CartContext";
import ProductGallery from "../components/product/ProductGallery";
import ProductInfo from "../components/product/ProductInfo";
import mockProducts from "../data/mockProducts";

const ProductDetail = ({ productId }) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  const products = Array.isArray(mockProducts) ? mockProducts : [];

  useEffect(() => {
    setLoading(true);
    const foundProduct = products.find((p) => p?.id === productId);
    setProduct(foundProduct || null);
    setLoading(false);
  }, [productId, products]);

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
  };

  const handleColorSelect = (color) => {
    setSelectedColor(color);
  };

  const handleQuantityChange = (newQuantity) => {
    setQuantity(newQuantity);
  };

  const handleAddToCart = () => {
    if (product && selectedSize) {
      addItem(product, quantity, selectedSize, selectedColor);
    }
  };

  if (loading) {
    return (
      <Center py={80}>
        <Loader size="lg" />
      </Center>
    );
  }

  if (!product) {
    return (
      <Container size="lg" py={80}>
        <Center>
          <Text size="xl" c="dimmed">
            Product not found
          </Text>
        </Center>
      </Container>
    );
  }

  const images = Array.isArray(product?.images) ? product.images : [];
  const sizes = Array.isArray(product?.sizes) ? product.sizes : [];
  const colors = Array.isArray(product?.colors) ? product.colors : [];

  return (
    <Container size="lg" py={48}>
      <Grid gutter={{ base: "md", md: 48 }}>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <ProductGallery
            images={images}
            productName={product?.name}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <ProductInfo
            product={product}
            selectedSize={selectedSize}
            selectedColor={selectedColor}
            quantity={quantity}
            onSizeSelect={handleSizeSelect}
            onColorSelect={handleColorSelect}
            onQuantityChange={handleQuantityChange}
            onAddToCart={handleAddToCart}
          />
        </Grid.Col>
      </Grid>
    </Container>
  );
};

export default ProductDetail;