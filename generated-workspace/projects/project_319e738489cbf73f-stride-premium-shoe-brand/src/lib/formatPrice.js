const formatPrice = (price) => {
  const safePrice = typeof price === "number" ? price : 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(safePrice);
};

export default formatPrice;