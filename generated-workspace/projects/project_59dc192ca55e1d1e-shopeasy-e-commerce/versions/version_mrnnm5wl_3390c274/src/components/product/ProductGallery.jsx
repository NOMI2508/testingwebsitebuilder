import { Image, Group, Box, rem } from "@mantine/core";
import { useState } from "react";

const ProductGallery = ({ product }) => {
  const [selectedImage, setSelectedImage] = useState(0);

  if (!product) {
    return null;
  }

  const { name, image } = product;

  // Generate additional thumbnail images based on the main image
  const thumbnails = [
    image,
    image.replace("/400/400", "/401/401"),
    image.replace("/400/400", "/402/402"),
    image.replace("/400/400", "/403/403"),
  ];

  return (
    <Box>
      <Box
        style={{
          border: "1px solid var(--mantine-color-gray-3)",
          borderRadius: rem(12),
          overflow: "hidden",
          marginBottom: rem(16),
        }}
      >
        <Image
          src={thumbnails[selectedImage]}
          alt={`${name} - view ${selectedImage + 1}`}
          height={400}
          style={{ objectFit: "cover", width: "100%" }}
        />
      </Box>

      <Group spacing="xs" position="center">
        {thumbnails.map((thumb, index) => (
          <Box
            key={index}
            onClick={() => setSelectedImage(index)}
            style={{
              cursor: "pointer",
              border: index === selectedImage
                ? "2px solid var(--mantine-color-brand-6)"
                : "2px solid transparent",
              borderRadius: rem(8),
              overflow: "hidden",
              transition: "border-color 150ms ease",
            }}
          >
            <Image
              src={thumb}
              alt={`${name} - thumbnail ${index + 1}`}
              width={80}
              height={80}
              style={{ objectFit: "cover" }}
            />
          </Box>
        ))}
      </Group>
    </Box>
  );
};

export default ProductGallery;