export type FoodMenuSeed = {
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
};

export type CafeteriaSeed = {
  name: string;
  description: string;
  imageUrl: string;
  cuisine: string;
  rating: number;
  isOpen: boolean;
  menuItems: FoodMenuSeed[];
};

export const FOOD_CAFETERIAS: CafeteriaSeed[] = [
  {
    name: "Spice Route Cafe",
    description: "Authentic Indian flavors — biryanis, curries, and street-style snacks.",
    imageUrl: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80",
    cuisine: "Indian",
    rating: 4.8,
    isOpen: true,
    menuItems: [
      { name: "Hyderabadi Biryani", description: "Aromatic basmati with tender chicken", price: 299, category: "Mains", imageUrl: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400&q=80" },
      { name: "Paneer Butter Masala", description: "Creamy tomato gravy with soft paneer", price: 249, category: "Mains", imageUrl: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&q=80" },
      { name: "Chicken Tikka Masala", description: "Char-grilled tikka in spiced tomato cream", price: 279, category: "Mains", imageUrl: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&q=80" },
      { name: "Dal Tadka", description: "Yellow lentils tempered with garlic and cumin", price: 149, category: "Mains", imageUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&q=80" },
      { name: "Masala Dosa", description: "Crispy rice crepe with spiced potato filling", price: 129, category: "Breakfast", imageUrl: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=400&q=80" },
      { name: "Idli Sambar (2 pc)", description: "Steamed rice cakes with lentil stew", price: 89, category: "Breakfast", imageUrl: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=400&q=80" },
      { name: "Samosa (2 pc)", description: "Crispy pastry with spiced potato filling", price: 59, category: "Snacks", imageUrl: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80" },
      { name: "Veg Spring Rolls", description: "Golden fried rolls with cabbage and carrot", price: 99, category: "Snacks", imageUrl: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&q=80" },
      { name: "Butter Naan", description: "Soft tandoor bread brushed with butter", price: 49, category: "Breads", imageUrl: "https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=400&q=80" },
      { name: "Garlic Naan", description: "Naan topped with fresh garlic and coriander", price: 59, category: "Breads", imageUrl: "https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=400&q=80" },
      { name: "Mango Lassi", description: "Chilled yogurt mango drink", price: 79, category: "Drinks", imageUrl: "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400&q=80" },
      { name: "Masala Chai", description: "Spiced Indian tea with milk", price: 39, category: "Drinks", imageUrl: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400&q=80" },
      { name: "Gulab Jamun (2 pc)", description: "Warm milk dumplings in rose syrup", price: 69, category: "Desserts", imageUrl: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=80" },
      { name: "Kheer", description: "Creamy rice pudding with cardamom and nuts", price: 89, category: "Desserts", imageUrl: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=80" },
    ],
  },
  {
    name: "Green Bowl Kitchen",
    description: "Fresh salads, grain bowls, and smoothies for a lighter meal.",
    imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80",
    cuisine: "Healthy",
    rating: 4.6,
    isOpen: true,
    menuItems: [
      { name: "Mediterranean Bowl", description: "Quinoa, hummus, feta, olives, and greens", price: 279, category: "Bowls", imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80" },
      { name: "Protein Power Bowl", description: "Grilled chicken, avocado, eggs, and brown rice", price: 319, category: "Bowls", imageUrl: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&q=80" },
      { name: "Buddha Bowl", description: "Roasted veggies, chickpeas, tahini dressing", price: 259, category: "Bowls", imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80" },
      { name: "Caesar Salad", description: "Romaine, parmesan, croutons, classic dressing", price: 199, category: "Salads", imageUrl: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&q=80" },
      { name: "Greek Salad", description: "Cucumber, tomato, feta, oregano vinaigrette", price: 189, category: "Salads", imageUrl: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&q=80" },
      { name: "Avocado Toast", description: "Sourdough, smashed avocado, chili flakes", price: 149, category: "Breakfast", imageUrl: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&q=80" },
      { name: "Berry Smoothie Bowl", description: "Acai blend topped with granola and banana", price: 229, category: "Breakfast", imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80" },
      { name: "Green Detox Juice", description: "Spinach, apple, celery, ginger, lemon", price: 129, category: "Drinks", imageUrl: "https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=400&q=80" },
      { name: "Cold Brew Coffee", description: "Slow-steeped iced coffee", price: 99, category: "Drinks", imageUrl: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80" },
    ],
  },
  {
    name: "Tower Bites",
    description: "Burgers, wraps, and comfort food — quick bites for busy residents.",
    imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80",
    cuisine: "Fast Food",
    rating: 4.5,
    isOpen: true,
    menuItems: [
      { name: "Classic Beef Burger", description: "Angus patty, cheddar, pickles, special sauce", price: 249, category: "Burgers", imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80" },
      { name: "Crispy Chicken Burger", description: "Fried chicken, coleslaw, spicy mayo", price: 229, category: "Burgers", imageUrl: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400&q=80" },
      { name: "Veggie Deluxe Burger", description: "Plant patty, avocado, caramelized onion", price: 219, category: "Burgers", imageUrl: "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400&q=80" },
      { name: "Grilled Chicken Wrap", description: "Tortilla, lettuce, tomato, garlic aioli", price: 199, category: "Wraps", imageUrl: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&q=80" },
      { name: "Falafel Wrap", description: "Crispy falafel, tahini, pickled veggies", price: 179, category: "Wraps", imageUrl: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&q=80" },
      { name: "French Fries", description: "Crispy golden fries with sea salt", price: 99, category: "Sides", imageUrl: "https://images.unsplash.com/photo-1472417583565-62e7bdeda490?w=400&q=80" },
      { name: "Onion Rings", description: "Beer-battered rings with ranch dip", price: 119, category: "Sides", imageUrl: "https://images.unsplash.com/photo-1639024471283-03518883512d?w=400&q=80" },
      { name: "Chocolate Milkshake", description: "Thick shake with whipped cream", price: 149, category: "Drinks", imageUrl: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&q=80" },
      { name: "Iced Lemon Tea", description: "Refreshing house-brewed lemon tea", price: 79, category: "Drinks", imageUrl: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80" },
    ],
  },
  {
    name: "Mumbai Chaat Corner",
    description: "Street-food favorites — pav bhaji, vada pav, and tangy chaats.",
    imageUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80",
    cuisine: "Street Food",
    rating: 4.7,
    isOpen: true,
    menuItems: [
      { name: "Pav Bhaji", description: "Spiced mashed veggies with buttered pav", price: 149, category: "Chaat", imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80" },
      { name: "Vada Pav", description: "Mumbai's favorite potato fritter in a bun", price: 49, category: "Chaat", imageUrl: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80" },
      { name: "Pani Puri (6 pc)", description: "Crisp puris with tangy tamarind water", price: 79, category: "Chaat", imageUrl: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400&q=80" },
      { name: "Bhel Puri", description: "Puffed rice, chutneys, onion, sev", price: 89, category: "Chaat", imageUrl: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=80" },
      { name: "Dahi Puri (6 pc)", description: "Crisp puris filled with yogurt and chutney", price: 99, category: "Chaat", imageUrl: "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=400&q=80" },
      { name: "Misal Pav", description: "Spicy sprout curry topped with farsan", price: 129, category: "Mains", imageUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&q=80" },
      { name: "Cutting Chai", description: "Half-cup strong masala tea", price: 25, category: "Drinks", imageUrl: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400&q=80" },
      { name: "Sweet Lassi", description: "Thick yogurt drink with cardamom", price: 59, category: "Drinks", imageUrl: "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400&q=80" },
    ],
  },
];
