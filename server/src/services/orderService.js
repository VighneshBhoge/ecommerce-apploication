import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function finalizeOrder(orderId) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order || order.status !== "PENDING") return;

  await prisma.$transaction(async (tx) => {
    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    await tx.order.update({
      where: { id: orderId },
      data: { status: "PAID" },
    });

    await tx.cartItem.deleteMany({ where: { userId: order.userId } });
  });
}
