// src/data/serviceCategories.js

export const SERVICE_CATEGORIES = [
  {
    name: "Home & Cleaning",
    items: [
      "Housekeeping",
      "Janitor",
      "Window Washing",
      "Driveway cleaning",
      "Gutter Cleaning",
      "Leaf blowing clean up service",
      "Snow Shoveling",
      "Shoe Polishing",
      "Repairman"
    ]
  },
  {
    name: "Outdoor & Yard",
    items: [
      "Gardening",
      "Lawn Mower",
      "Yard Maintenance",
      "Driveway cleaning",
      "Leaf blowing clean up service",
      "Plant Keeper"
    ]
  },
  {
    name: "Pets & Animals",
    items: [
      "Animal grooming",
      "Animal Sitting",
      "Dog Walker",
      "Pet Sitting"
    ]
  },
  {
    name: "Food & Events",
    items: [
      "Baker",
      "Pastry",
      "Meat Smoker",
      "Catering",
      "Barista",
      "Barman",
      "Bartender",
      "Busboy",
      "Cooks",
      "Event Planner",
      "Wedding Organizer"
    ]
  },
  {
    name: "Beauty & Personal Care",
    items: [
      "Barber",
      "Hairstyling",
      "Personal Trainer",
      "Sewing",
      "Artists",
      "Designer",
      "Graphism"
    ]
  },
  {
    name: "Professional & Finance",
    items: [
      "Accountants",
      "CPA",
      "Financial Advisors",
      "Taxes",
      "Investors",
      "Sales Person",
      "Security"
    ]
  },
  {
    name: "Creative & Media",
    items: [
      "Artists",
      "Drawers",
      "DJ",
      "Musician",
      "Photographer",
      "Video Editing",
      "Web Designer",
      "3D printers"
    ]
  },
  {
    name: "Kids & Education",
    items: [
      "Babysitter",
      "Childcare",
      "Private Lessons",
      "Tutoring"
    ]
  },
  {
    name: "Auto & Transport",
    items: [
      "Car cleaner",
      "Mechanic",
      "Driver",
      "Transport",
      "Movers"
    ]
  },
  {
    name: "Other Services",
    items: [
      "Custom",
      "Other"
    ]
  }
];

// Flattened list for quick suggestions
export const ALL_SERVICE_SUGGESTIONS = SERVICE_CATEGORIES.flatMap((cat) =>
  cat.items.map((label) => ({
    label,
    category: cat.name
  }))
);
