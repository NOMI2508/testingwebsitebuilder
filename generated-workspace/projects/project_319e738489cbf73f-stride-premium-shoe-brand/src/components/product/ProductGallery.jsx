import { Box, Image, Group, rem } from "@mantine/core";
import { useHover } from "@mantine/hooks";
import { useState } from "react";

const ProductGallery = ({ images = [], productName = "Product" }) => {
  const [mainImage, setMainImage] = useState(0);
  const { ref, hovered } = useHover();
  
  const safeImages = Array.isArray(images) && images.length > 0 
    ? images 
    : ["https://placehold.co/600x600?text=Product+Image"];

  const handleThumbnailClick = (index) => {
    setMainImage(index);
  };

  return (
    <Box>
      <Box
        ref={ref}
        pos="relative"
        mb="md"
        style={{
          overflow: "hidden",
          borderRadius: rem(12),
          cursor: "zoom-in"
        }}
      >
        <Image
          src={safeImages[mainImage]}
          alt={`${productName} - View ${mainImage + 1}`}
          fit="cover"
          style={{
            transition: "transform 300ms ease",
            transform: hovered ? "scale(1.05)" : "scale(1)",
            width: "100%",
            height: rem(400),
            objectFit: "cover"
          }}
          fallbackSrc="https://placehold.co/600x600?text=Product+Image"
        />
      </Box>

      {safeImages.length > 1 && (
        <Group gap="xs" justify="center" wrap="nowrap" style={{ overflowX: "auto" }}>
          {safeImages.map((image, index) => (
            <Box
              key={index}
              onClick={() => handleThumbnailClick(index)}
              style={{
                cursor: "pointer",
                borderRadius: rem(8),
                border: index === mainImage 
                  ? "2px solid var(--mantine-color-gold-6)" 
                  : "2px solid transparent",
                transition: "border-color 150ms ease",
                overflow: "hidden",
                minWidth: rem(64),
                minHeight: rem(64)
              }}
            >
              <Image
                src={image}
                alt={`${productName} - Thumbnail ${index + 1}`}
                width={rem(64)}
                height={rem(64)}
                fit="cover"
                style={{
                  opacity: index === mainImage ? 1 : 0.7,
                  transition: "opacity 150ms ease"
                }}
                fallbackSrc="https://placehold.co/64x64?text=Thumb"
              />
            </Box>
          ))}
        </Group>
      )}
    </Box>
  );
};

export default ProductGallery;