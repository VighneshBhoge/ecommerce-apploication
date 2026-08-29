import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CATEGORY_IMAGES = {
  Electronics: [
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1597872250970-45600a58e545?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1507646227500-4d389b0012be?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80",
  ],
  Clothing: [
    "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&auto=format&fit=crop&q=80",
  ],
  "Home & Living": [
    "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&auto=format&fit=crop&q=80",
  ],
  Accessories: [
    "https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
  ],
  "Sports & Fitness": [
    "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&auto=format&fit=crop&q=80",
  ],
  "Books & Stationery": [
    "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80",
  ],
  "Beauty & Care": [
    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600&auto=format&fit=crop&q=80",
  ],
  Gaming: [
    "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&auto=format&fit=crop&q=80",
  ],
  Footwear: [
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&auto=format&fit=crop&q=80",
  ],
  Jewelry: [
    "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&auto=format&fit=crop&q=80",
  ],
};

const TEMPLATES = [
  { prefix: "Ultra", suffix: "Pro" },
  { prefix: "Pro", suffix: "Edition" },
  { prefix: "Classic", suffix: "V2" },
  { prefix: "Elite", suffix: "Max" },
  { prefix: "Premium", suffix: "Series" },
  { prefix: "Smart", suffix: "Plus" },
  { prefix: "Flex", suffix: "Lite" },
  { prefix: "Studio", suffix: "Master" },
  { prefix: "Zenith", suffix: "Prime" },
  { prefix: "Apex", suffix: "X" },
];

const ITEMS_PER_CATEGORY = {
  Electronics: ["Wireless Earbuds", "Bluetooth Speaker", "Smart Watch", "HD Webcam", "Mechanical Mouse", "Fast Charger", "USB-C Hub", "Noise-Cancelling Mic", "LED Desk Light", "Gaming Router"],
  Clothing: ["Organic Cotton Tee", "Slim Fit Chinos", "Windbreaker Jacket", "Polo Shirt", "Fleece Hoodie", "Thermal Innerwear", "Casual Shorts", "Designer Blazer", "Overcoat", "Cargo Pants"],
  "Home & Living": ["Ergonomic Cushion", "Bamboo Bed Sheets", "Desk Organizer", "Diffuser Set", "Abstract Wall Art", "Stainless Water Bottle", "Ceramic Bowl Set", "Soft Floor Rug", "Minimalist Wall Clock"],
  Accessories: ["Leather Cardholder", "Polarized Sunglasses", "Minimalist Belt", "Canvas Tote Bag", "Travel Duffel", "Key Organizer", "Beanie Hat", "Laptop Sleeve", "Leather Keychain"],
  "Sports & Fitness": ["Yoga Block Set", "Adjustable Dumbbell", "Speed Jump Rope", "Hydration Vest", "Fitness Tracker Band", "Compression Sleeves", "Exercise Ball", "Gripper Set"],
  "Books & Stationery": ["Hardcover Journal", "Fountain Pen Set", "Productivity Planner", "Minimalist Notebook", "Sticky Note Bundle", "Desk Mat", "Calligraphy Markers"],
  "Beauty & Care": ["Hyaluronic Face Serum", "Organic Lip Balm", "Botanical Body Wash", "Vitamin C Scrub", "Nourishing Hair Mask", "Gentle Cleanser", "Matte Sunscreen"],
  Gaming: ["RGB Mechanical Mousepad", "Ergonomic Gaming Chair", "Ultra-Wide Monitor Stand", "Wireless Controller", "Console Cooling Fan", "Braided Cable Set"],
  Footwear: ["Comfort Loafers", "Trail Running Shoes", "Classic Leather Oxford", "Breathable Slip-ons", "High-Top Sneakers", "Waterproof Boots"],
  Jewelry: ["Minimalist Silver Ring", "Gold Plated Pendant", "Leather Band Watch", "Braided Bracelet", "Stud Earrings", "Titanium Cufflinks"],
};

async function main() {
  console.log("🚀 Starting Bulk Data Seeding (500+ items)...");

  // 1. Ensure Categories Exist
  const categoryNames = Object.keys(ITEMS_PER_CATEGORY);
  const categoryMap = {};

  for (const name of categoryNames) {
    const cat = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    categoryMap[name] = cat.id;
  }

  // 2. Generate 500 Products
  const productsToInsert = [];
  let totalCount = 0;

  for (const [catName, baseItems] of Object.entries(ITEMS_PER_CATEGORY)) {
    const catId = categoryMap[catName];
    const images = CATEGORY_IMAGES[catName] || CATEGORY_IMAGES.Electronics;

    for (const item of baseItems) {
      for (const t of TEMPLATES) {
        const name = `${t.prefix} ${item} ${t.suffix}`;
        const price = (Math.floor(Math.random() * 250) + 10) * 1000 + 999; // ₹1,099 to ₹250,999 in paise
        const stock = Math.floor(Math.random() * 80) + 5;
        const imageUrl = images[totalCount % images.length];

        productsToInsert.push({
          name,
          description: `High-quality ${name} designed for maximum durability, style, and everyday comfort. Comes with 1-year warranty.`,
          price,
          stock,
          imageUrl,
          categoryId: catId,
        });

        totalCount++;
      }
    }
  }

  console.log(`📦 Generated ${productsToInsert.length} product records. Inserting in batches...`);

  // Batch insert in chunks of 100 for optimal speed
  const chunkSize = 100;
  for (let i = 0; i < productsToInsert.length; i += chunkSize) {
    const chunk = productsToInsert.slice(i, i + chunkSize);
    await prisma.product.createMany({
      data: chunk,
      skipDuplicates: true,
    });
    console.log(`  ✓ Inserted items ${i + 1} to ${Math.min(i + chunkSize, productsToInsert.length)}`);
  }

  const finalCount = await prisma.product.count();
  console.log(`\n🎉 Bulk Seeding Completed Successfully! Total Products in Database: ${finalCount}`);
}

main()
  .catch((e) => {
    console.error("❌ Bulk Seed Error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
