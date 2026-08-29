import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();

router.use(requireAuth);

router.get("/", async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json({ orders });
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
    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order || order.userId !== req.user.id) {
      return res.status(404).json({ error: "Order not found" });
    }
    if (!["PENDING", "PAID"].includes(order.status)) {
      return res.status(400).json({ error: `Cannot cancel an order with status ${order.status}` });
    }

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: { status: "CANCELLED" },
      include: { items: { include: { product: true } } },
    });

    if (order.status === "PAID") {
      await Promise.all(
        order.items?.length
          ? []
          : updated.items.map((item) =>
              prisma.product.update({
                where: { id: item.productId },
                data: { stock: { increment: item.quantity } },
              })
            )
      );
      for (const item of updated.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
    }

    res.json({ order: updated });
  } catch (err) {
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
