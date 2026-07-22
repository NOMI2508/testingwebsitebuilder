import imageAssets from "./imageAssets";

const products = [
  {
    id: 1,
    name: "Wireless Bluetooth Headphones",
    description:
      "Premium wireless headphones with active noise cancellation, 30-hour battery life, and crystal-clear sound quality. Perfect for music lovers and professionals alike.",
    price: 199.99,
    category: "Electronics",
    image: imageAssets.placeholders.product1,
    rating: 4.5,
    stock: 50,
  },
  {
    id: 2,
    name: "Smart Fitness Watch",
    description:
      "Track your health and fitness goals with this advanced smartwatch. Features heart rate monitoring, sleep tracking, and smartphone notifications.",
    price: 149.99,
    category: "Electronics",
    image: imageAssets.placeholders.product2,
    rating: 4.3,
    stock: 75,
  },
  {
    id: 3,
    name: "Organic Cotton T-Shirt",
    description:
      "Soft, breathable organic cotton t-shirt available in multiple colors. Ethically sourced and sustainably made for everyday comfort.",
    price: 29.99,
    category: "Clothing",
    image: imageAssets.placeholders.product3,
    rating: 4.7,
    stock: 100,
  },
  {
    id: 4,
    name: "Stainless Steel Water Bottle",
    description:
      "Keep your drinks cold for 24 hours or hot for 12 hours with this premium insulated water bottle. BPA-free and eco-friendly.",
    price: 34.99,
    category: "Home",
    image: imageAssets.placeholders.product4,
    rating: 4.6,
    stock: 150,
  },
  {
    id: 5,
    name: "Running Sneakers",
    description:
      "Lightweight running shoes with responsive cushioning and breathable mesh upper. Designed for maximum comfort and performance.",
    price: 89.99,
    category: "Clothing",
    image: imageAssets.placeholders.product5,
    rating: 4.4,
    stock: 80,
  },
  {
    id: 6,
    name: "Laptop Backpack",
    description:
      "Sleek, water-resistant backpack with padded laptop compartment, USB charging port, and multiple organizational pockets.",
    price: 59.99,
    category: "Electronics",
    image: imageAssets.placeholders.product6,
    rating: 4.2,
    stock: 60,
  },
  {
    id: 7,
    name: "Ceramic Coffee Mug Set",
    description:
      "Set of 4 handcrafted ceramic mugs with modern minimalist design. Dishwasher and microwave safe.",
    price: 39.99,
    category: "Home",
    image: imageAssets.placeholders.product7,
    rating: 4.8,
    stock: 120,
  },
  {
    id: 8,
    name: "Wireless Charging Pad",
    description:
      "Fast wireless charging pad compatible with all Qi-enabled devices. Sleek design with LED indicator and non-slip surface.",
    price: 24.99,
    category: "Electronics",
    image: imageAssets.placeholders.product8,
    rating: 4.1,
    stock: 90,
  },
  {
    id: 9,
    name: "Denim Jacket",
    description:
      "Classic denim jacket with vintage wash and distressed details. Features button closure and multiple pockets.",
    price: 79.99,
    category: "Clothing",
    image: imageAssets.placeholders.product9,
    rating: 4.3,
    stock: 45,
  },
  {
    id: 10,
    name: "Scented Candle Collection",
    description:
      "Set of 3 premium soy candles with long-lasting fragrances: Lavender, Vanilla, and Sandalwood.",
    price: 29.99,
    category: "Home",
    image: imageAssets.placeholders.product10,
    rating: 4.5,
    stock: 85,
  },
  {
    id: 11,
    name: "Bluetooth Speaker",
    description:
      "Portable waterproof speaker with 12-hour playtime and rich bass. Perfect for indoor and outdoor use.",
    price: 49.99,
    category: "Electronics",
    image: imageAssets.placeholders.product11,
    rating: 4.4,
    stock: 70,
  },
  {
    id: 12,
    name: "Yoga Leggings",
    description:
      "High-waisted yoga leggings with moisture-wicking fabric and four-way stretch for maximum flexibility.",
    price: 45.99,
    category: "Clothing",
    image: imageAssets.placeholders.product12,
    rating: 4.6,
    stock: 110,
  },
  {
    id: 13,
    name: "Stainless Steel Cookware Set",
    description:
      "12-piece professional cookware set with aluminum core for even heating. Includes pans, pots, and lids.",
    price: 199.99,
    category: "Home",
    image: imageAssets.placeholders.product13,
    rating: 4.7,
    stock: 30,
  },
  {
    id: 14,
    name: "Tablet Stand",
    description:
      "Adjustable aluminum tablet stand with multiple viewing angles. Compatible with tablets and smartphones.",
    price: 29.99,
    category: "Electronics",
    image: imageAssets.placeholders.product14,
    rating: 4.2,
    stock: 95,
  },
  {
    id: 15,
    name: "Flannel Shirt",
    description:
      "Soft brushed flannel shirt with classic check pattern. Button-down collar and chest pocket.",
    price: 54.99,
    category: "Clothing",
    image: imageAssets.placeholders.product15,
    rating: 4.3,
    stock: 65,
  },
  {
    id: 16,
    name: "Aromatherapy Diffuser",
    description:
      "Ultrasonic essential oil diffuser with 7 LED color options and automatic shut-off. Creates a relaxing atmosphere.",
    price: 34.99,
    category: "Home",
    image: imageAssets.placeholders.product16,
    rating: 4.5,
    stock: 75,
  },
  {
    id: 17,
    name: "USB-C Hub",
    description:
      "7-in-1 USB-C hub with HDMI, USB 3.0, SD card reader, and Ethernet port. Compact aluminum design.",
    price: 44.99,
    category: "Electronics",
    image: imageAssets.placeholders.product17,
    rating: 4.1,
    stock: 55,
  },
  {
    id: 18,
    name: "Running Shorts",
    description:
      "Lightweight running shorts with built-in compression liner and zip pocket for essentials.",
    price: 39.99,
    category: "Clothing",
    image: imageAssets.placeholders.product18,
    rating: 4.4,
    stock: 85,
  },
  {
    id: 19,
    name: "Throw Pillow Set",
    description:
      "Set of 2 decorative throw pillows with linen blend cover and soft polyester fill.",
    price: 32.99,
    category: "Home",
    image: imageAssets.placeholders.product19,
    rating: 4.3,
    stock: 100,
  },
  {
    id: 20,
    name: "Portable Power Bank",
    description:
      "10000mAh portable charger with fast charging and dual USB ports. Compact design with LED indicator.",
    price: 27.99,
    category: "Electronics",
    image: imageAssets.placeholders.product20,
    rating: 4.2,
    stock: 120,
  },
  {
    id: 21,
    name: "Hooded Sweatshirt",
    description:
      "Cozy fleece hoodie with adjustable drawstring and front kangaroo pocket. Available in multiple colors.",
    price: 49.99,
    category: "Clothing",
    image: imageAssets.placeholders.product21,
    rating: 4.5,
    stock: 90,
  },
  {
    id: 22,
    name: "Kitchen Storage Containers",
    description:
      "Set of 5 airtight food storage containers with bamboo lids. Perfect for meal prep and pantry organization.",
    price: 36.99,
    category: "Home",
    image: imageAssets.placeholders.product22,
    rating: 4.6,
    stock: 65,
  },
  {
    id: 23,
    name: "Noise Cancelling Earbuds",
    description:
      "True wireless earbuds with active noise cancellation and 24-hour total battery life with case.",
    price: 129.99,
    category: "Electronics",
    image: imageAssets.placeholders.product23,
    rating: 4.4,
    stock: 40,
  },
  {
    id: 24,
    name: "Summer Dress",
    description:
      "Flowy midi dress with floral print and adjustable tie waist. Lightweight fabric perfect for warm weather.",
    price: 59.99,
    category: "Clothing",
    image: imageAssets.placeholders.product24,
    rating: 4.7,
    stock: 70,
  },
  {
    id: 25,
    name: "Desk Organizer",
    description:
      "Bamboo desk organizer with multiple compartments for stationery, phone, and accessories.",
    price: 31.99,
    category: "Home",
    image: imageAssets.placeholders.product25,
    rating: 4.3,
    stock: 80,
  },
  {
    id: 26,
    name: "Smartphone Lens Kit",
    description:
      "Clip-on lens kit with wide-angle, macro, and fisheye lenses for mobile photography.",
    price: 22.99,
    category: "Electronics",
    image: imageAssets.placeholders.product26,
    rating: 4.0,
    stock: 100,
  },
  {
    id: 27,
    name: "Crewneck Sweater",
    description:
      "Classic crewneck sweater in soft merino wool blend. Timeless style for any occasion.",
    price: 69.99,
    category: "Clothing",
    image: imageAssets.placeholders.product27,
    rating: 4.5,
    stock: 55,
  },
  {
    id: 28,
    name: "Indoor Plant Pot Set",
    description:
      "Set of 3 ceramic plant pots with drainage holes and matching saucers. Modern geometric design.",
    price: 26.99,
    category: "Home",
    image: imageAssets.placeholders.product28,
    rating: 4.4,
    stock: 95,
  },
  {
    id: 29,
    name: "Wireless Mouse",
    description:
      "Ergonomic wireless mouse with adjustable DPI and silent clicks. Compatible with all devices.",
    price: 39.99,
    category: "Electronics",
    image: imageAssets.placeholders.product29,
    rating: 4.2,
    stock: 75,
  },
  {
    id: 30,
    name: "Chino Pants",
    description:
      "Slim-fit chino pants with stretch fabric and zip fly. Versatile style for work or weekend.",
    price: 54.99,
    category: "Clothing",
    image: imageAssets.placeholders.product30,
    rating: 4.3,
    stock: 85,
  },
];

const categories = ["All", "Electronics", "Clothing", "Home"];

const getProductsByCategory = (category) => {
  if (!category || category === "All") {
    return products;
  }
  return products.filter((product) => product.category === category);
};

const getProductById = (id) => {
  const numericId = typeof id === "string" ? Number.parseInt(id, 10) : id;
  return products.find((product) => product.id === numericId) || null;
};

export { products, categories, getProductsByCategory, getProductById };
export default products;