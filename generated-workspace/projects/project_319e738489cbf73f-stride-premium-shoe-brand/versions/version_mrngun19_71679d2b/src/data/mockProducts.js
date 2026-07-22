const mockProducts = [
  {
    id: "1",
    name: "Urban Classic Sneaker",
    description: "A timeless silhouette reimagined with premium leather and cushioned footbed for all-day comfort. Perfect for both casual outings and smart-casual occasions.",
    price: 189.99,
    salePrice: null,
    category: "sneakers",
    rating: 4.8,
    reviewCount: 124,
    images: [
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80",
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80&angle=1",
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80&angle=2"
    ],
    sizes: [7, 8, 9, 10, 11, 12],
    colors: ["black", "white", "taupe"],
    material: "Premium leather upper with rubber sole",
    inStock: true
  },
  {
    id: "2",
    name: "Alpine Trail Boot",
    description: "Rugged yet refined boot designed for outdoor adventures without compromising on style. Water-resistant construction with reinforced toe cap.",
    price: 249.99,
    salePrice: 199.99,
    category: "boots",
    rating: 4.6,
    reviewCount: 89,
    images: [
      "https://images.unsplash.com/photo-1608231388708-40e76e2a1d23?w=800&q=80",
      "https://images.unsplash.com/photo-1608231388708-40e76e2a1d23?w=800&q=80&angle=1"
    ],
    sizes: [8, 9, 10, 11, 12],
    colors: ["brown", "black"],
    material: "Water-resistant suede with leather accents",
    inStock: true
  },
  {
    id: "3",
    name: "Sprint Elite Runner",
    description: "Engineered for peak performance with responsive midsole cushioning and breathable mesh upper. Designed for serious runners who demand excellence.",
    price: 159.99,
    salePrice: null,
    category: "athletic",
    rating: 4.9,
    reviewCount: 203,
    images: [
      "https://images.unsplash.com/photo-1595950291288-7a2b3b3b3b3b?w=800&q=80",
      "https://images.unsplash.com/photo-1595950291288-7a2b3b3b3b3b?w=800&q=80&angle=1"
    ],
    sizes: [7, 8, 9, 10, 11, 12, 13],
    colors: ["blue", "gray", "red"],
    material: "Breathable mesh with EVA midsole",
    inStock: true
  },
  {
    id: "4",
    name: "Weekend Loafer",
    description: "Effortless sophistication in a slip-on design. Handcrafted with supple leather and featuring our signature comfort insole.",
    price: 179.99,
    salePrice: null,
    category: "casual",
    rating: 4.7,
    reviewCount: 67,
    images: [
      "https://images.unsplash.com/photo-1614259056978-7c4c5b7b7b7b?w=800&q=80",
      "https://images.unsplash.com/photo-1614259056978-7c4c5b7b7b7b?w=800&q=80&angle=1"
    ],
    sizes: [7, 8, 9, 10, 11],
    colors: ["brown", "black", "navy"],
    material: "Full-grain leather with cushioned footbed",
    inStock: true
  },
  {
    id: "5",
    name: "Metropolitan Oxford",
    description: "The perfect blend of formal and casual. Traditional brogue detailing meets contemporary comfort technology.",
    price: 219.99,
    salePrice: 189.99,
    category: "casual",
    rating: 4.5,
    reviewCount: 94,
    images: [
      "https://images.unsplash.com/photo-1614259056978-7c4c5b7b7b7b?w=800&q=80",
      "https://images.unsplash.com/photo-1614259056978-7c4c5b7b7b7b?w=800&q=80&angle=1"
    ],
    sizes: [8, 9, 10, 11, 12],
    colors: ["black", "brown"],
    material: "Polished leather with leather lining",
    inStock: true
  },
  {
    id: "6",
    name: "Summit Hiking Boot",
    description: "Conquer any terrain with confidence. Features ankle support, aggressive tread pattern, and waterproof membrane.",
    price: 289.99,
    salePrice: null,
    category: "boots",
    rating: 4.8,
    reviewCount: 156,
    images: [
      "https://images.unsplash.com/photo-1608231388708-40e76e2a1d23?w=800&q=80",
      "https://images.unsplash.com/photo-1608231388708-40e76e2a1d23?w=800&q=80&angle=1"
    ],
    sizes: [8, 9, 10, 11, 12, 13],
    colors: ["brown", "black"],
    material: "Waterproof leather with Vibram sole",
    inStock: true
  },
  {
    id: "7",
    name: "Court Pro Sneaker",
    description: "Basketball-inspired design with modern streetwear appeal. Signature silhouette with bold branding.",
    price: 149.99,
    salePrice: null,
    category: "sneakers",
    rating: 4.4,
    reviewCount: 78,
    images: [
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80",
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80&angle=1"
    ],
    sizes: [7, 8, 9, 10, 11],
    colors: ["white", "black", "red"],
    material: "Synthetic upper with rubber outsole",
    inStock: true
  },
  {
    id: "8",
    name: "Marathon Training Shoe",
    description: "Designed for long-distance running with maximum cushioning and energy return. Lightweight yet durable for serious training.",
    price: 179.99,
    salePrice: null,
    category: "athletic",
    rating: 4.7,
    reviewCount: 167,
    images: [
      "https://images.unsplash.com/photo-1595950291288-7a2b3b3b3b3b?w=800&q=80",
      "https://images.unsplash.com/photo-1595950291288-7a2b3b3b3b3b?w=800&q=80&angle=1"
    ],
    sizes: [7, 8, 9, 10, 11, 12],
    colors: ["gray", "blue", "green"],
    material: "Engineered mesh with responsive foam midsole",
    inStock: true
  },
  {
    id: "9",
    name: "Desert Chukka Boot",
    description: "Ankle-high boot with minimalist design. Perfect for transitioning from day to evening wear with ease.",
    price: 229.99,
    salePrice: 199.99,
    category: "boots",
    rating: 4.6,
    reviewCount: 112,
    images: [
      "https://images.unsplash.com/photo-1608231388708-40e76e2a1d23?w=800&q=80",
      "https://images.unsplash.com/photo-1608231388708-40e76e2a1d23?w=800&q=80&angle=1"
    ],
    sizes: [7, 8, 9, 10, 11, 12],
    colors: ["tan", "brown", "black"],
    material: "Suede leather with leather sole",
    inStock: true
  },
  {
    id: "10",
    name: "Canvas Slip-On",
    description: "Lightweight and breathable slip-on shoe for warm weather. Classic canvas construction with cushioned insole.",
    price: 99.99,
    salePrice: null,
    category: "casual",
    rating: 4.3,
    reviewCount: 45,
    images: [
      "https://images.unsplash.com/photo-1614259056978-7c4c5b7b7b7b?w=800&q=80",
      "https://images.unsplash.com/photo-1614259056978-7c4c5b7b7b7b?w=800&q=80&angle=1"
    ],
    sizes: [6, 7, 8, 9, 10, 11],
    colors: ["navy", "white", "black"],
    material: "Canvas upper with rubber sole",
    inStock: true
  },
  {
    id: "11",
    name: "Performance Track Shoe",
    description: "Competition-ready spike shoe for track and field events. Lightweight carbon fiber plate for maximum propulsion.",
    price: 239.99,
    salePrice: null,
    category: "athletic",
    rating: 4.9,
    reviewCount: 88,
    images: [
      "https://images.unsplash.com/photo-1595950291288-7a2b3b3b3b3b?w=800&q=80",
      "https://images.unsplash.com/photo-1595950291288-7a2b3b3b3b3b?w=800&q=80&angle=1"
    ],
    sizes: [7, 8, 9, 10, 11, 12],
    colors: ["yellow", "black", "blue"],
    material: "Flyknit upper with carbon fiber plate",
    inStock: true
  },
  {
    id: "12",
    name: "Retro High-Top",
    description: "Vintage-inspired high-top with modern comfort features. Bold ankle coverage with signature branding.",
    price: 169.99,
    salePrice: 149.99,
    category: "sneakers",
    rating: 4.5,
    reviewCount: 143,
    images: [
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80",
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80&angle=1"
    ],
    sizes: [8, 9, 10, 11, 12],
    colors: ["white", "black", "red"],
    material: "Suede and leather combination",
    inStock: true
  }
];

export default mockProducts;