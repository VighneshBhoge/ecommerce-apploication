import { prisma } from "../lib/prisma.js";

export async function getWishlist(req, res, next) {
  try {
    const items = await prisma.wishlistItem.findMany({
      where: { userId: req.user.id },
      include: { product: { include: { category: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json({ items });
  } catch (err) {
    next(err);
  }
}

export async function addToWishlist(req, res, next) {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ error: "productId is required" });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const existing = await prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId: req.user.id, productId } },
    });

    if (existing) {
      return res.json({ item: existing, alreadyExists: true });
    }

    const item = await prisma.wishlistItem.create({
      data: { userId: req.user.id, productId },
      include: { product: true },
    });

    res.status(201).json({ item });
  } catch (err) {
    next(err);
  }
}

export async function removeFromWishlist(req, res, next) {
  try {
    const { productId } = req.params;

    const existing = await prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId: req.user.id, productId } },
    });

    if (!existing) {
      return res.status(404).json({ error: "Not in wishlist" });
    }

    await prisma.wishlistItem.delete({
      where: { id: existing.id },
    });

    res.json({ message: "Removed from wishlist" });
  } catch (err) {
    next(err);
  }
}
