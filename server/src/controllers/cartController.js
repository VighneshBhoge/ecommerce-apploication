import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function getCartResponse(userId) {
  const items = await prisma.cartItem.findMany({
    where: { userId },
    include: { product: true },
    orderBy: { createdAt: "asc" },
  });

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  return { items, subtotal, count };
}

export async function getCart(req, res, next) {
  try {
    res.json(await getCartResponse(req.user.id));
  } catch (err) {
    next(err);
  }
}

export async function addToCart(req, res, next) {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId || quantity < 1) {
      return res.status(400).json({ error: "productId and a positive quantity are required" });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    if (product.stock === 0) {
      return res.status(400).json({ error: "Product is out of stock" });
    }

    const existing = await prisma.cartItem.findUnique({
      where: { userId_productId: { userId: req.user.id, productId } },
    });

    const newQty = Math.min((existing?.quantity || 0) + quantity, product.stock);

    await prisma.cartItem.upsert({
      where: { userId_productId: { userId: req.user.id, productId } },
      update: { quantity: newQty },
      create: { userId: req.user.id, productId, quantity: newQty },
    });

    res.status(201).json(await getCartResponse(req.user.id));
  } catch (err) {
    next(err);
  }
}

export async function updateCartItem(req, res, next) {
  try {
    const quantity = parseInt(req.body.quantity);
    const item = await prisma.cartItem.findUnique({ where: { id: req.params.id } });

    if (!item || item.userId !== req.user.id) {
      return res.status(404).json({ error: "Cart item not found" });
    }

    if (!quantity || quantity < 0) {
      return res.status(400).json({ error: "A non-negative quantity is required" });
    }

    if (quantity === 0) {
      await prisma.cartItem.delete({ where: { id: item.id } });
    } else {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      await prisma.cartItem.update({
        where: { id: item.id },
        data: { quantity: Math.min(quantity, product.stock) },
      });
    }

    res.json(await getCartResponse(req.user.id));
  } catch (err) {
    next(err);
  }
}

export async function removeCartItem(req, res, next) {
  try {
    const item = await prisma.cartItem.findUnique({ where: { id: req.params.id } });

    if (!item || item.userId !== req.user.id) {
      return res.status(404).json({ error: "Cart item not found" });
    }

    await prisma.cartItem.delete({ where: { id: item.id } });

    res.json(await getCartResponse(req.user.id));
  } catch (err) {
    next(err);
  }
}
