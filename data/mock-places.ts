// src/data/mock-places.ts
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  popular?: boolean;
  spicy?: boolean;
  vegetarian?: boolean;
}

export interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}

export interface Place {
  id: string;
  name: string;
  type: string;
  rating: number;
  reviewCount: number;
  distance: string;
  priceRange: string;
  images: string[];
  description: string;
  location: string;
  workingHours: string;
  features: string[];
  menu: MenuCategory[];
  reviews: {
    author: string;
    rating: number;
    date: string;
    text: string;
  }[];
}

export const savedPlaces: Place[] = [
  {
    id: "1",
    name: "Alley Palace",
    type: "Bar & Restaurant",
    rating: 4.1,
    reviewCount: 2100,
    distance: "0.8km",
    priceRange: "$$",
    images: [
      "https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=2974&auto=format&fit=crop",
    ],
    description:
      "A cozy place with great atmosphere and live music. Perfect for evening hangouts and special occasions.",
    location: "123 Main Street, Tashkent",
    workingHours: "12:00 PM - 11:00 PM",
    features: ["Live Music", "Outdoor Seating", "Bar", "WiFi"],
    menu: [
      {
        id: "starters",
        name: "Starters",
        items: [
          {
            id: "s1",
            name: "Bruschetta",
            description:
              "Grilled bread rubbed with garlic and topped with olive oil, salt, and fresh tomatoes",
            price: 8.99,
            image:
              "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?q=80&w=2787&auto=format&fit=crop",
            popular: true,
          },
          {
            id: "s2",
            name: "Spinach Artichoke Dip",
            description:
              "Creamy dip with spinach, artichoke hearts, and melted cheese",
            price: 10.99,
            image:
              "https://images.unsplash.com/photo-1576506295286-5cda18df43e7?q=80&w=2779&auto=format&fit=crop",
            vegetarian: true,
          },
        ],
      },
      {
        id: "main",
        name: "Main Courses",
        items: [
          {
            id: "m1",
            name: "Grilled Salmon",
            description: "Fresh salmon fillet with lemon herb butter sauce",
            price: 24.99,
            image:
              "https://images.unsplash.com/photo-1485704686097-ed47f7263ca4?q=80&w=2819&auto=format&fit=crop",
            popular: true,
          },
          {
            id: "m2",
            name: "Spicy Chicken Pasta",
            description:
              "Penne pasta with grilled chicken in spicy tomato sauce",
            price: 18.99,
            image:
              "https://images.unsplash.com/photo-1608897013039-887f21d8c804?q=80&w=2824&auto=format&fit=crop",
            spicy: true,
          },
        ],
      },
      {
        id: "drinks",
        name: "Drinks",
        items: [
          {
            id: "d1",
            name: "Signature Cocktail",
            description: "House special with premium spirits and fresh fruits",
            price: 12.99,
            image:
              "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2940&auto=format&fit=crop",
            popular: true,
          },
        ],
      },
    ],
    reviews: [
      {
        author: "John Doe",
        rating: 4,
        date: "2 days ago",
        text: "Great atmosphere and amazing cocktails!",
      },
    ],
  },
  {
    id: "2",
    name: "Sakura Asian",
    type: "Clubs",
    rating: 4.7,
    reviewCount: 3240,
    distance: "1.2km",
    priceRange: "$$$",
    images: [
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2940&auto=format&fit=crop",
    ],
    description:
      "Modern Asian fusion restaurant offering innovative dishes combining Japanese, Korean, and Chinese cuisines with a contemporary twist.",
    location: "45 Amir Temur Avenue, Tashkent",
    workingHours: "11:00 AM - 10:00 PM",
    features: [
      "Private Dining",
      "Sushi Bar",
      "Vegan Options",
      "Wine Selection",
    ],
    menu: [
      {
        id: "appetizers",
        name: "Appetizers",
        items: [
          {
            id: "a1",
            name: "Dragon Roll",
            description:
              "Premium sushi roll with eel, avocado, cucumber, and special sauce",
            price: 16.99,
            image:
              "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=2940&auto=format&fit=crop",
            popular: true,
          },
          {
            id: "a2",
            name: "Vegetable Gyoza",
            description:
              "Pan-fried dumplings filled with vegetables and Asian spices",
            price: 9.99,
            image:
              "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?q=80&w=2940&auto=format&fit=crop",
            vegetarian: true,
          },
        ],
      },
      {
        id: "main_dishes",
        name: "Main Dishes",
        items: [
          {
            id: "m1",
            name: "Korean BBQ Bowl",
            description:
              "Grilled marinated beef with rice, kimchi, and vegetables",
            price: 22.99,
            image:
              "https://images.unsplash.com/photo-1583471889815-fa7e8714c9f6?q=80&w=2940&auto=format&fit=crop",
            popular: true,
            spicy: true,
          },
          {
            id: "m2",
            name: "Teriyaki Salmon",
            description:
              "Grilled salmon with teriyaki glaze, served with steamed rice",
            price: 25.99,
            image:
              "https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?q=80&w=2940&auto=format&fit=crop",
          },
        ],
      },
    ],
    reviews: [
      {
        author: "Sarah Chen",
        rating: 5,
        date: "1 week ago",
        text: "Best Asian fusion in the city! The Dragon Roll is a must-try.",
      },
    ],
  },
  {
    id: "3",
    name: "Café Nouveau",
    type: "Coffee Shop & Bakery",
    rating: 4.5,
    reviewCount: 1850,
    distance: "0.5km",
    priceRange: "$",
    images: [
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=2947&auto=format&fit=crop",
    ],
    description:
      "Charming café offering artisanal coffee, freshly baked pastries, and light meals in a cozy atmosphere perfect for work or relaxation.",
    location: "78 Shahrisabz Street, Tashkent",
    workingHours: "7:00 AM - 8:00 PM",
    features: ["Free WiFi", "Outdoor Seating", "Pastry Shop", "Workspace"],
    menu: [
      {
        id: "coffee",
        name: "Coffee & Tea",
        items: [
          {
            id: "c1",
            name: "Specialty Latte",
            description:
              "House-blend espresso with steamed milk and artisanal flavors",
            price: 4.99,
            image:
              "https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=2937&auto=format&fit=crop",
            popular: true,
          },
          {
            id: "c2",
            name: "Matcha Green Tea",
            description: "Premium Japanese matcha whisked to perfection",
            price: 5.99,
            image:
              "https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?q=80&w=2940&auto=format&fit=crop",
          },
        ],
      },
      {
        id: "pastries",
        name: "Pastries",
        items: [
          {
            id: "p1",
            name: "Croissant Selection",
            description:
              "Freshly baked butter, almond, or chocolate croissants",
            price: 3.99,
            image:
              "https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=2946&auto=format&fit=crop",
            popular: true,
          },
        ],
      },
    ],
    reviews: [
      {
        author: "Emily Watson",
        rating: 4,
        date: "3 days ago",
        text: "Perfect spot for working remotely. Great coffee and atmosphere!",
      },
    ],
  },
  {
    id: "4",
    name: "Uzbek House",
    type: "Traditional Uzbek",
    rating: 4.8,
    reviewCount: 2750,
    distance: "1.5km",
    priceRange: "$$",
    images: [
      "https://images.unsplash.com/photo-1731005723692-d371597f83bb?q=80&w=2922&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    ],
    description:
      "Authentic Uzbek restaurant serving traditional dishes in a warm, family-friendly setting with classic décor and hospitality.",
    location: "156 Navoi Street, Tashkent",
    workingHours: "10:00 AM - 11:00 PM",
    features: [
      "Traditional Setting",
      "Family Style",
      "Live Folk Music",
      "Garden Seating",
    ],
    menu: [
      {
        id: "starters_uz",
        name: "Starters",
        items: [
          {
            id: "su1",
            name: "Uzbek Salads",
            description:
              "Selection of fresh seasonal salads with local vegetables",
            price: 7.99,
            image:
              "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2940&auto=format&fit=crop",
            vegetarian: true,
          },
          {
            id: "su2",
            name: "Samsa",
            description: "Traditional baked pastry filled with lamb and spices",
            price: 5.99,
            image:
              "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=2940&auto=format&fit=crop",
            popular: true,
          },
        ],
      },
      {
        id: "main_uz",
        name: "Main Courses",
        items: [
          {
            id: "mu1",
            name: "Plov",
            description:
              "Traditional Uzbek rice dish with tender lamb, carrots, and spices",
            price: 16.99,
            image:
              "https://images.unsplash.com/photo-1578888213392-83c6aa79cff2?q=80&w=2940&auto=format&fit=crop",
            popular: true,
          },
          {
            id: "mu2",
            name: "Shashlik Set",
            description:
              "Assorted grilled meat skewers with marinaded vegetables",
            price: 24.99,
            image:
              "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=2940&auto=format&fit=crop",
          },
        ],
      },
    ],
    reviews: [
      {
        author: "Alex Johnson",
        rating: 5,
        date: "5 days ago",
        text: "Most authentic Uzbek food I've had! The plov is exceptional.",
      },
    ],
  },
  {
    id: "5",
    name: "Coffee Maniacs",
    type: "Cafes",
    rating: 3.1,
    reviewCount: 3100,
    distance: "3.5km",
    priceRange: "$$",
    images: [
      "https://images.unsplash.com/photo-1508766917616-d22f3f1eea14?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    ],
    description: "Best Coffee in Tashkent with unique vibe",
    location: "156 Navoi Street, Tashkent",
    workingHours: "11:00 AM - 11:00 PM",
    features: [
      "Arabic Coffee",
      "Modern Style",
      "Nomad Seating",
      "Relaxing Music",
    ],
    menu: [
      {
        id: "starters_uz",
        name: "Starters",
        items: [
          {
            id: "su1",
            name: "Americano",
            description: "Fresh coffee with a shot of espresso and hot water",
            price: 7.99,
            image:
              "https://images.unsplash.com/photo-1504417335905-7d7bfe044558?q=80&w=2942&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            vegetarian: true,
          },
          {
            id: "su2",
            name: "Samsa",
            description: "Traditional baked pastry filled with lamb and spices",
            price: 5.99,
            image:
              "https://images.unsplash.com/photo-1697021833001-5efd7b33b348?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGFtZXJpY2Fub3xlbnwwfHwwfHx8MA%3D%3D",
            popular: true,
          },
        ],
      },
      {
        id: "main_uz",
        name: "Main Courses",
        items: [
          {
            id: "mu1",
            name: "Capuccino",
            description:
              "Classic coffee with steamed milk foam and a shot of espresso",
            price: 16.99,
            image:
              "https://images.unsplash.com/photo-1711117205751-323ec1189b46?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjR8fGFtZXJpY2Fub3xlbnwwfHwwfHx8MA%3D%3D",
            popular: true,
          },
          {
            id: "mu2",
            name: "Mociato",
            description:
              "Milk coffee with a shot of espresso and a dash of chocolate",
            price: 24.99,
            image:
              "https://images.unsplash.com/photo-1697021833011-1d695df02e6b?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGFtZXJpY2Fub3xlbnwwfHwwfHx8MA%3D%3D",
          },
        ],
      },
    ],
    reviews: [
      {
        author: "Alex Johnson",
        rating: 5,
        date: "5 days ago",
        text: "Most authentic coffee shop food I've had! The americano is great.",
      },
    ],
  },
];
