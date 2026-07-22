const formatPrice = (price) => {
  const numericPrice = typeof price === "number" ? price : Number.parseFloat(price);
  if (Number.isNaN(numericPrice)) {
    return "$0.00";
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericPrice);
};

export default formatPrice;