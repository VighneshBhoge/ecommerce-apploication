import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../lib/prisma.js";

const router = Router();

router.use(requireAuth);

router.get("/", async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId: req.user.id },
        skip,
        take: limit,
        include: { items: { include: { product: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.order.count({ where: { userId: req.user.id } }),
    ]);

    res.json({
      orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { items: { include: { product: true } } },
    });

    if (!order || order.userId !== req.user.id) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({ order });
  } catch (err) {
    next(err);
  }
});

router.post("/:id/cancel", async (req, res, next) => {
  try {
    const updatedOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: req.params.id },
        include: { items: true },
      });

      if (!order || order.userId !== req.user.id) {
        const err = new Error("Order not found");
        err.status = 404;
        throw err;
      }

      if (order.status === "DELIVERED") {
        const err = new Error("Cannot cancel a delivered order");
        err.status = 400;
        throw err;
      }

      if (!["PENDING", "PAID"].includes(order.status)) {
        const err = new Error(`Cannot cancel an order with status ${order.status}`);
        err.status = 400;
        throw err;
      }

      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }

      return await tx.order.update({
        where: { id: req.params.id },
        data: { status: "CANCELLED" },
        include: { items: { include: { product: true } } },
      });
    });

    res.json({ order: updatedOrder, message: "Order cancelled and stock restored" });
  } catch (err) {
    if (err.status === 404) return res.status(404).json({ error: err.message });
    if (err.status === 400) return res.status(400).json({ error: err.message });
    next(err);
  }
});

router.get("/:id/invoice", async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { items: { include: { product: true } }, user: { select: { name: true, email: true } } },
    });
    if (!order || order.userId !== req.user.id) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json({ order });
  } catch (err) {
    next(err);
  }
});

export default router;
