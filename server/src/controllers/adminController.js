import { prisma } from "../lib/prisma.js";

export async function getStats(req, res, next) {
  try {
    const [productCount, orderCount, userCount, revenueAgg] = await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.user.count(),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { in: ["PAID", "SHIPPED", "DELIVERED"] } },
      }),
    ]);

    res.json({
      stats: {
        products: productCount,
        orders: orderCount,
        users: userCount,
        revenue: revenueAgg._sum.total || 0,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function createProduct(req, res, next) {
  try {
    const { name, description, price, imageUrl, images, brand, stock, categoryId } = req.body;

    if (!name || !price || !categoryId) {
      return res.status(400).json({ error: "Name, price and category are required" });
    }

    const finalImageUrl = req.file?.path || imageUrl || `https://picsum.photos/seed/${encodeURIComponent(name)}/600/400`;

    const product = await prisma.product.create({
      data: {
        name,
        description: description || "",
        price: parseInt(price),
        imageUrl: finalImageUrl,
        images: Array.isArray(images) ? images : [],
        brand: brand || null,
        stock: parseInt(stock) || 0,
        categoryId,
      },
      include: { category: true },
    });

    res.status(201).json({ product });
  } catch (err) {
    next(err);
  }
}

export async function updateProduct(req, res, next) {
  try {
    const existing = await prisma.product.findUnique({
      where: { id: req.params.id },
    });
    if (!existing) {
      return res.status(404).json({ error: "Product not found" });
    }

    const { name, description, price, imageUrl, images, brand, stock, categoryId } = req.body;
    const finalImageUrl = req.file?.path || imageUrl;

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: parseInt(price) }),
        ...(finalImageUrl !== undefined && { imageUrl: finalImageUrl }),
        ...(images !== undefined && { images: Array.isArray(images) ? images : [] }),
        ...(brand !== undefined && { brand: brand || null }),
        ...(stock !== undefined && { stock: parseInt(stock) }),
        ...(categoryId !== undefined && { categoryId }),
      },
      include: { category: true },
    });

    res.json({ product });
  } catch (err) {
    next(err);
  }
}

export async function deleteProduct(req, res, next) {
  try {
    const existing = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { _count: { select: { orderItems: true } } },
    });

    if (!existing) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (existing._count.orderItems > 0) {
      return res.status(400).json({
        error:
          "This product belongs to past orders and cannot be deleted. Set its stock to 0 instead.",
      });
    }

    await prisma.product.delete({ where: { id: req.params.id } });

    res.json({ message: "Product deleted" });
  } catch (err) {
    next(err);
  }
}

export async function getAllOrders(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          items: { include: { product: true } },
        },
      }),
      prisma.order.count(),
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
}

export async function updateOrderStatus(req, res, next) {
  try {
    const { status } = req.body;
    const validStatuses = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const order = await prisma.$transaction(async (tx) => {
      const existing = await tx.order.findUnique({
        where: { id: req.params.id },
        include: { items: true },
      });

      if (!existing) {
        const error = new Error("Order not found");
        error.status = 404;
        throw error;
      }

      if (existing.status === "DELIVERED" && status === "CANCELLED") {
        const error = new Error("Cannot cancel a delivered order");
        error.status = 400;
        throw error;
      }

      if (status === "CANCELLED" && existing.status !== "CANCELLED") {
        for (const item of existing.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      return await tx.order.update({
        where: { id: req.params.id },
        data: { status },
        include: {
          user: { select: { name: true, email: true } },
          items: { include: { product: true } },
        },
      });
    });

    res.json({ order });
  } catch (err) {
    if (err.code === "P2025" || err.status === 404) {
      return res.status(404).json({ error: "Order not found" });
    }
    if (err.status === 400) {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
}

export async function getCustomers(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          _count: { select: { orders: true } },
        },
      }),
      prisma.user.count(),
    ]);

    res.json({
      users,
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
}

export async function updateCustomerRole(req, res, next) {
  try {
    const { role } = req.body;
    if (!["CUSTOMER", "ADMIN"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }
    if (req.user.id === req.params.id && role !== "ADMIN") {
      return res.status(400).json({ error: "You cannot demote yourself" });
    }
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });
    res.json({ user });
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ error: "User not found" });
    next(err);
  }
}
