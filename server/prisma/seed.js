import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);
  const adminHash = await bcrypt.hash("admin123", 10);

  await prisma.user.upsert({
    where: { email: "customer@shop.com" },
    update: {},
    create: {
      name: "Demo Customer",
      email: "customer@shop.com",
      passwordHash,
      role: "CUSTOMER",
    },
  });

  await prisma.user.upsert({
    where: { email: "admin@shop.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@shop.com",
      passwordHash: adminHash,
      role: "ADMIN",
    },
  });

  const categories = await Promise.all(
    ["Electronics", "Clothing", "Home", "Accessories"].map((name) =>
      prisma.category.upsert({
        where: { name },
        update: {},
        create: { name },
      })
    )
  );

  const [electronics, clothing, home, accessories] = categories;

  const products = [
    {
      name: "Wireless Headphones",
      description: "Over-ear Bluetooth headphones with active noise cancellation and 30h battery life.",
      price: 12999,
      stock: 25,
      imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
      categoryId: electronics.id,
    },
    {
      name: "Mechanical Keyboard",
      description: "Hot-swappable RGB mechanical keyboard with brown switches.",
      price: 8999,
      stock: 40,
      imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80",
      categoryId: electronics.id,
    },
    {
      name: "4K Monitor 27\"",
      description: "27-inch 4K IPS display with USB-C connectivity and HDR support.",
      price: 34999,
      stock: 10,
      imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80",
      categoryId: electronics.id,
    },
    {
      name: "Portable SSD 1TB",
      description: "Fast USB-C portable solid state drive with 1050MB/s read speeds.",
      price: 10999,
      stock: 30,
      imageUrl: "https://images.unsplash.com/photo-1597872250970-45600a58e545?w=600&auto=format&fit=crop&q=80",
      categoryId: electronics.id,
    },
    {
      name: "Classic Denim Jacket",
      description: "Timeless denim jacket with a comfortable regular fit.",
      price: 5999,
      stock: 50,
      imageUrl: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&auto=format&fit=crop&q=80",
      categoryId: clothing.id,
    },
    {
      name: "Crewneck Sweatshirt",
      description: "Soft cotton-blend sweatshirt available in multiple colors.",
      price: 3499,
      stock: 60,
      imageUrl: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&auto=format&fit=crop&q=80",
      categoryId: clothing.id,
    },
    {
      name: "Running Sneakers",
      description: "Lightweight running shoes with responsive cushioning.",
      price: 7499,
      stock: 35,
      imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80",
      categoryId: clothing.id,
    },
    {
      name: "Ceramic Coffee Mug Set",
      description: "Set of 4 handcrafted ceramic mugs, dishwasher safe.",
      price: 2999,
      stock: 45,
      imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80",
      categoryId: home.id,
    },
    {
      name: "Scented Candle Trio",
      description: "Three soy-wax candles: vanilla, sandalwood, and fresh linen.",
      price: 2499,
      stock: 70,
      imageUrl: "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=600&auto=format&fit=crop&q=80",
      categoryId: home.id,
    },
    {
      name: "Throw Blanket",
      description: "Ultra-soft woven throw blanket, perfect for couch or bed.",
      price: 3999,
      stock: 40,
      imageUrl: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&auto=format&fit=crop&q=80",
      categoryId: home.id,
    },
    {
      name: "Leather Wallet",
      description: "Genuine leather bifold wallet with RFID protection.",
      price: 4599,
      stock: 55,
      imageUrl: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=80",
      categoryId: accessories.id,
    },
    {
      name: "Canvas Backpack",
      description: "Durable water-resistant canvas backpack with laptop sleeve.",
      price: 6499,
      stock: 20,
      imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80",
      categoryId: accessories.id,
    },
  ];

  for (const item of products) {
    const found = await prisma.product.findFirst({ where: { name: item.name } });
    if (found) {
      await prisma.product.update({
        where: { id: found.id },
        data: { imageUrl: item.imageUrl },
      });
    } else {
      await prisma.product.create({ data: item });
    }
  }

  // Also fix any generic/random picsum links for custom items
  const allProducts = await prisma.product.findMany({ include: { category: true } });
  for (const p of allProducts) {
    if (p.imageUrl.includes("picsum.photos")) {
      const fallbackUrl = `https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80`;
      await prisma.product.update({
        where: { id: p.id },
        data: { imageUrl: fallbackUrl },
      });
    }
  }

  const brandMap = { Electronics: "Sony", Clothing: "Zara", Home: "IKEA", Accessories: "Fossil" };
  for (const p of await prisma.product.findMany({ include: { category: true } })) {
    const needsBrand = !p.brand;
    const needsImages = !p.images || p.images.length === 0;
    if (needsBrand || needsImages) {
      await prisma.product.update({
        where: { id: p.id },
        data: {
          ...(needsBrand && { brand: brandMap[p.category.name] || "Generic" }),
          ...(needsImages && { images: [p.imageUrl] }),
        },
      });
    }
  }

  await prisma.coupon.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: {
      code: "WELCOME10",
      discountType: "PERCENT",
      discountValue: 10,
      minOrderValue: 10000,
      maxUses: 100,
    },
  });

  await prisma.coupon.upsert({
    where: { code: "FLAT500" },
    update: {},
    create: {
      code: "FLAT500",
      discountType: "FLAT",
      discountValue: 50000,
      minOrderValue: 20000,
      maxUses: 50,
    },
  });

  await prisma.coupon.upsert({
    where: { code: "SAVE20" },
    update: {},
    create: {
      code: "SAVE20",
      discountType: "PERCENT",
      discountValue: 20,
      minOrderValue: 30000,
      maxUses: 30,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  console.log("Coupons seeded: WELCOME10 (10% off 10k+), FLAT500 (₹500 off 20k+), SAVE20 (20% off 30k+)");
  console.log("Seed and image updates completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
