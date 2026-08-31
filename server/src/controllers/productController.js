import { prisma } from "../lib/prisma.js";
import { getCache, setCache } from "../lib/redis.js";

export async function getProducts(req, res, next) {
  try {
    const cacheKey = `products:${JSON.stringify(req.query)}`;
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    const {
      search,
      category,
      brand,
      page = "1",
      limit = "12",
      minPrice,
      maxPrice,
      sort = "newest",
    } = req.query;

    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category) {
      where.category = { name: { equals: category, mode: "insensitive" } };
    }

    if (brand) {
      where.brand = { equals: brand, mode: "insensitive" };
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseInt(minPrice);
      if (maxPrice) where.price.lte = parseInt(maxPrice);
    }

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(48, Math.max(1, parseInt(limit) || 12));
    const skip = (pageNum - 1) * limitNum;

    let orderBy = { createdAt: "desc" };
    if (sort === "price_asc") orderBy = { price: "asc" };
    else if (sort === "price_desc") orderBy = { price: "desc" };
    else if (sort === "rating") orderBy = { avgRating: "desc" };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true },
        skip,
        take: limitNum,
        orderBy,
      }),
      prisma.product.count({ where }),
    ]);

    const responsePayload = {
      products,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    };

    await setCache(cacheKey, responsePayload, 300);

    res.json(responsePayload);
  } catch (err) {
    next(err);
  }
}

export async function autocomplete(req, res, next) {
  try {
    const q = (req.query.q || "").trim();
    if (!q || q.length < 2) {
      return res.json({ suggestions: [] });
    }

    const suggestions = await prisma.product.findMany({
      where: { name: { contains: q, mode: "insensitive" } },
      select: { id: true, name: true, imageUrl: true, price: true },
      take: 5,
    });

    res.json({ suggestions });
  } catch (err) {
    next(err);
  }
}

export async function getBrands(req, res, next) {
  try {
    const rows = await prisma.product.findMany({
      where: { brand: { not: null } },
      distinct: ["brand"],
      select: { brand: true },
    });
    res.json({ brands: rows.map((r) => r.brand).filter(Boolean).sort() });
  } catch (err) {
    next(err);
  }
}

export async function getProductById(req, res, next) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { category: true },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ product });
  } catch (err) {
    next(err);
  }
}

export async function getCategories(req, res, next) {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { products: true } } },
    });
    res.json({ categories });
  } catch (err) {
    next(err);
  }
}
