import { prisma } from "../lib/prisma.js";

export async function validateCoupon(req, res, next) {
  try {
    const { code, total } = req.body;
    if (!code) {
      return res.status(400).json({ error: "Coupon code is required" });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase().trim() },
    });

    if (!coupon || !coupon.isActive) {
      return res.status(404).json({ error: "Invalid coupon code" });
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return res.status(400).json({ error: "Coupon has expired" });
    }

    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
      return res.status(400).json({ error: "Coupon usage limit reached" });
    }

    const orderTotal = parseInt(total) || 0;
    if (orderTotal < coupon.minOrderValue) {
      return res.status(400).json({
        error: `Minimum order value is ₹${(coupon.minOrderValue / 100).toFixed(2)}`,
      });
    }

    let discount = 0;
    if (coupon.discountType === "PERCENT") {
      discount = Math.floor((orderTotal * coupon.discountValue) / 100);
    } else {
      discount = coupon.discountValue;
    }
    discount = Math.min(discount, orderTotal);

    res.json({
      coupon: { code: coupon.code, discountType: coupon.discountType, discountValue: coupon.discountValue },
      discount,
    });
  } catch (err) {
    next(err);
  }
}

export async function listCoupons(req, res, next) {
  try {
    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
    res.json({ coupons });
  } catch (err) {
    next(err);
  }
}

export async function createCoupon(req, res, next) {
  try {
    const { code, discountType, discountValue, minOrderValue, maxUses, expiresAt } = req.body;
    if (!code || !discountType || discountValue == null) {
      return res.status(400).json({ error: "code, discountType and discountValue are required" });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase().trim(),
        discountType,
        discountValue: parseInt(discountValue),
        minOrderValue: parseInt(minOrderValue) || 0,
        maxUses: maxUses ? parseInt(maxUses) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    res.status(201).json({ coupon });
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ error: "Coupon code already exists" });
    }
    next(err);
  }
}

export async function deleteCoupon(req, res, next) {
  try {
    await prisma.coupon.delete({ where: { id: req.params.id } });
    res.json({ message: "Coupon deleted" });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Coupon not found" });
    }
    next(err);
  }
}
