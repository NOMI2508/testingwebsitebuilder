const imageAssets = {
  placeholders: {
    product1: "https://picsum.photos/seed/product1/400/400",
    product2: "https://picsum.photos/seed/product2/400/400",
    product3: "https://picsum.photos/seed/product3/400/400",
    product4: "https://picsum.photos/seed/product4/400/400",
    product5: "https://picsum.photos/seed/product5/400/400",
    product6: "https://picsum.photos/seed/product6/400/400",
    product7: "https://picsum.photos/seed/product7/400/400",
    product8: "https://picsum.photos/seed/product8/400/400",
    product9: "https://picsum.photos/seed/product9/400/400",
    product10: "https://picsum.photos/seed/product10/400/400",
    product11: "https://picsum.photos/seed/product11/400/400",
    product12: "https://picsum.photos/seed/product12/400/400",
    product13: "https://picsum.photos/seed/product13/400/400",
    product14: "https://picsum.photos/seed/product14/400/400",
    product15: "https://picsum.photos/seed/product15/400/400",
    product16: "https://picsum.photos/seed/product16/400/400",
    product17: "https://picsum.photos/seed/product17/400/400",
    product18: "https://picsum.photos/seed/product18/400/400",
    product19: "https://picsum.photos/seed/product19/400/400",
    product20: "https://picsum.photos/seed/product20/400/400",
    product21: "https://picsum.photos/seed/product21/400/400",
    product22: "https://picsum.photos/seed/product22/400/400",
    product23: "https://picsum.photos/seed/product23/400/400",
    product24: "https://picsum.photos/seed/product24/400/400",
    product25: "https://picsum.photos/seed/product25/400/400",
    product26: "https://picsum.photos/seed/product26/400/400",
    product27: "https://picsum.photos/seed/product27/400/400",
    product28: "https://picsum.photos/seed/product28/400/400",
    product29: "https://picsum.photos/seed/product29/400/400",
    product30: "https://picsum.photos/seed/product30/400/400",
  },
  getPlaceholder: (id) => {
    const num = (id % 30) + 1;
    return `https://picsum.photos/seed/product${num}/400/400`;
  },
  getPlaceholderThumb: (id) => {
    const num = (id % 30) + 1;
    return `https://picsum.photos/seed/product${num}thumb/100/100`;
  },
};

export default imageAssets;