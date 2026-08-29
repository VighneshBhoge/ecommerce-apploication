import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getProductReviews(req, res, next) {
  try {
    const { id } = req.params;
    const reviews = await prisma.review.findMany({
      where: { productId: id },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    });

    const avg =
      reviews.length === 0
        ? 0
        : reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;

    res.json({ reviews, avg, count: reviews.length });
  } catch (err) {
    next(err);
  }
}

export async function upsertReview(req, res, next) {
  try {
    const { id: productId } = req.params;
    const { rating, comment } = req.body;

    const parsedRating = parseInt(rating);
    if (!parsedRating || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }
    if (!comment || !comment.trim()) {
      return res.status(400).json({ error: "Comment is required" });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const review = await prisma.review.upsert({
      where: { userId_productId: { userId: req.user.id, productId } },
      update: { rating: parsedRating, comment: comment.trim() },
      create: {
        userId: req.user.id,
        productId,
        rating: parsedRating,
        comment: comment.trim(),
      },
      include: { user: { select: { id: true, name: true } } },
    });

    const isUpdate = await prisma.review.count({
      where: { userId: req.user.id, productId },
    });

    res.status(201).json({ review });
  } catch (err) {
    next(err);
  }
}

export async function deleteReview(req, res, next) {
  try {
    const { id: productId } = req.params;

    const existing = await prisma.review.findUnique({
      where: { userId_productId: { userId: req.user.id, productId } },
    });

    if (!existing) {
      return res.status(404).json({ error: "Review not found" });
    }

    await prisma.review.delete({ where: { id: existing.id } });
    res.json({ message: "Review deleted" });
  } catch (err) {
    next(err);
  }
}
