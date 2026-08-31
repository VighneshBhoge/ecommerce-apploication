import { prisma } from "../lib/prisma.js";

async function updateProductRatingStats(tx, productId) {
  const stats = await tx.review.aggregate({
    where: { productId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  const avgRating = stats._avg.rating ? Math.round(stats._avg.rating * 10) / 10 : 0;
  const reviewCount = stats._count.rating || 0;

  await tx.product.update({
    where: { id: productId },
    data: { avgRating, reviewCount },
  });

  return { avgRating, reviewCount };
}

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
        : Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10;

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

    const review = await prisma.$transaction(async (tx) => {
      const savedReview = await tx.review.upsert({
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

      await updateProductRatingStats(tx, productId);
      return savedReview;
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

    await prisma.$transaction(async (tx) => {
      await tx.review.delete({ where: { id: existing.id } });
      await updateProductRatingStats(tx, productId);
    });

    res.json({ message: "Review deleted" });
  } catch (err) {
    next(err);
  }
}
