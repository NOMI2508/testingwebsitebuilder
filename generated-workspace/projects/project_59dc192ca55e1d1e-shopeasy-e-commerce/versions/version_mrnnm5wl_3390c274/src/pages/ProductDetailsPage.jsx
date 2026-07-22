import { Container, Grid, GridCol, Box, rem, Alert, Center } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { useParams } from "react-router-dom";
import StoreLayout from "../components/layout/StoreLayout";
import ProductGallery from "../components/product/ProductGallery";
import ProductInfo from "../components/product/ProductInfo";
import { getProductById } from "../data/products";

const ProductDetailsPage = () => {
  const { id } = useParams();
  const product = getProductById(id);

  if (!product) {
    return (
      <Container size="xl" px="md" py="xl">
        <Center>
          <Alert
            icon={<IconAlertCircle size={rem(20)} />}
            title="Product Not Found"
            color="error"
            variant="light"
          >
            The product you're looking for doesn't exist or has been removed.
          </Alert>
        </Center>
      </Container>
    );
  }

  return (
    <Container size="xl" px="md" py="xl">
      <Grid gutter="xl">
        <GridCol span={12} md={6}>
          <ProductGallery product={product} />
        </GridCol>
        <GridCol span={12} md={6}>
          <ProductInfo product={product} />
        </GridCol>
      </Grid>
    </Container>
  );
};

export default ProductDetailsPage;