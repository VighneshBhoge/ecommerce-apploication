import { prisma } from "../lib/prisma.js";
import { sendOrderConfirmation } from "./emailService.js";

export async function finalizeOrder(orderId) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, user: { select: { name: true, email: true } } },
  });

  if (!order || order.status !== "PENDING") return;

  await prisma.$transaction(async (tx) => {
    for (const item of order.items) {
      const updated = await tx.product.updateMany({
        where: {
          id: item.productId,
          stock: { gte: item.quantity },
        },
        data: { stock: { decrement: item.quantity } },
      });

      if (updated.count === 0) {
        throw new Error(`Insufficient stock for product ${item.productId}`);
      }
    }

    await tx.order.update({
      where: { id: orderId },
      data: { status: "PAID" },
    });

    await tx.cartItem.deleteMany({ where: { userId: order.userId } });
  });

  if (order.user) {
    sendOrderConfirmation(order.user, order).catch(() => {});
  }
}
