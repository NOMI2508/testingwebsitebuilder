const siteContent = {
  shopName: "Brew & Bean Café",
  logo: "☕",
  hero: {
    headline: "Crafted with Care, Served with Love",
    subheadline: "Discover the perfect cup at our cozy corner café. Every bean is thoughtfully sourced and expertly roasted.",
    ctaPrimary: "View Our Menu",
    ctaSecondary: "Find Us"
  },
  menu: {
    categories: [
      { id: "espresso", label: "Espresso" },
      { id: "brewed", label: "Brewed Coffee" },
      { id: "specialty", label: "Specialty Drinks" }
    ],
    items: [
      {
        id: 1,
        name: "Classic Espresso",
        description: "Rich, bold shot of our signature blend with notes of chocolate and caramel",
        price: 3.50,
        category: "espresso",
        image: "https://images.unsplash.com/photo-1511920170033-f83969272f99?w=400&q=80"
      },
      {
        id: 2,
        name: "Double Espresso",
        description: "Two shots of our premium espresso blend for that extra kick",
        price: 4.25,
        category: "espresso",
        image: "https://images.unsplash.com/photo-1511920170033-f83969272f99?w=400&q=80"
      },
      {
        id: 3,
        name: "Cappuccino",
        description: "Espresso with velvety steamed milk and a light foam topping",
        price: 4.75,
        category: "espresso",
        image: "https://images.unsplash.com/photo-1572441710266-80f80a3a3b99?w=400&q=80"
      },
      {
        id: 4,
        name: "Latte",
        description: "Smooth espresso with steamed milk and a thin layer of foam",
        price: 5.25,
        category: "espresso",
        image: "https://images.unsplash.com/photo-1561083268-8a3daa8e2a26?w=400&q=80"
      },
      {
        id: 5,
        name: "House Blend Drip",
        description: "Our signature medium roast, brewed fresh every hour",
        price: 2.75,
        category: "brewed",
        image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80"
      },
      {
        id: 6,
        name: "Pour Over",
        description: "Single-origin beans brewed to order with precision and care",
        price: 4.50,
        category: "brewed",
        image: "https://images.unsplash.com/photo-1511920170033-f83969272f99?w=400&q=80"
      },
      {
        id: 7,
        name: "Cold Brew",
        description: "Smooth, low-acidity coffee steeped for 18 hours, served over ice",
        price: 4.75,
        category: "brewed",
        image: "https://images.unsplash.com/photo-1511920170033-f83969272f99?w=400&q=80"
      },
      {
        id: 8,
        name: "Nitro Cold Brew",
        description: "Cold brew infused with nitrogen for a creamy, stout-like texture",
        price: 5.50,
        category: "brewed",
        image: "https://images.unsplash.com/photo-1561083268-8a3daa8e2a26?w=400&q=80"
      },
      {
        id: 9,
        name: "Caramel Macchiato",
        description: "Vanilla syrup, steamed milk, espresso, and caramel drizzle",
        price: 5.75,
        category: "specialty",
        image: "https://images.unsplash.com/photo-1572441710266-80f80a3a3b99?w=400&q=80"
      },
      {
        id: 10,
        name: "Hazelnut Mocha",
        description: "Rich chocolate, hazelnut syrup, espresso, and steamed milk",
        price: 5.95,
        category: "specialty",
        image: "https://images.unsplash.com/photo-1561083268-8a3daa8e2a26?w=400&q=80"
      },
      {
        id: 11,
        name: "Seasonal Pumpkin Spice",
        description: "Our fall favorite with pumpkin spice, steamed milk, and espresso",
        price: 5.50,
        category: "specialty",
        image: "https://images.unsplash.com/photo-1572441710266-80f80a3a3b99?w=400&q=80"
      },
      {
        id: 12,
        name: "Vanilla Bean Latte",
        description: "House-made vanilla syrup with our smooth espresso and milk",
        price: 5.25,
        category: "specialty",
        image: "https://images.unsplash.com/photo-1561083268-8a3daa8e2a26?w=400&q=80"
      }
    ]
  },
  contact: {
    address: "123 Coffee Street, Downtown District, City 12345",
    phone: "(555) 123-4567",
    email: "hello@brewandbeancafe.com",
    hours: [
      { day: "Monday - Friday", time: "7:00 AM - 7:00 PM" },
      { day: "Saturday", time: "8:00 AM - 8:00 PM" },
      { day: "Sunday", time: "8:00 AM - 6:00 PM" }
    ],
    socialMedia: {
      instagram: "@brewandbeancafe",
      facebook: "BrewAndBeanCafe",
      twitter: "@brewandbean"
    }
  }
};

export default siteContent;