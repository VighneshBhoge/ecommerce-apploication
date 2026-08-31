import Razorpay from "razorpay";
import crypto from "crypto";
import { prisma } from "../lib/prisma.js";
import { finalizeOrder } from "../services/orderService.js";

let cachedRazorpay = null;

function getRazorpay() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret || keyId.includes("...")) {
    const err = new Error(
      "Razorpay is not configured. Add your test keys to server/.env"
    );
    err.status = 503;
    throw err;
  }

  if (!cachedRazorpay) {
    cachedRazorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
  }
  return cachedRazorpay;
}

export async function createPaymentOrder(req, res, next) {
  try {
    const razorpay = getRazorpay();

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ error: "Your cart is empty" });
    }

    const outOfStock = cartItems.find((i) => i.quantity > i.product.stock);
    if (outOfStock) {
      return res.status(400).json({
        error: `"${outOfStock.product.name}" only has ${outOfStock.product.stock} left in stock`,
      });
    }

    const cartTotal = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    let discount = 0;
    let couponCode = null;
    const rawCode = (req.body.couponCode || "").toUpperCase().trim();
    if (rawCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: rawCode } });
      if (!coupon || !coupon.isActive) {
        return res.status(400).json({ error: "Invalid coupon code" });
      }
      if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
        return res.status(400).json({ error: "Coupon has expired" });
      }
      if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
        return res.status(400).json({ error: "Coupon usage limit reached" });
      }
      if (cartTotal < coupon.minOrderValue) {
        return res.status(400).json({
          error: `Minimum order value is ₹${(coupon.minOrderValue / 100).toFixed(2)}`,
        });
      }
      if (coupon.discountType === "PERCENT") {
        discount = Math.floor((cartTotal * coupon.discountValue) / 100);
      } else {
        discount = coupon.discountValue;
      }
      discount = Math.min(discount, cartTotal);
      couponCode = coupon.code;
    }

    const total = cartTotal - discount;

    const order = await prisma.order.create({
      data: {
        userId: req.user.id,
        total,
        discount,
        couponCode,
        status: "PENDING",
        items: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            priceAtPurchase: item.product.price,
          })),
        },
      },
    });

    const razorpayOrder = await razorpay.orders.create({
      amount: total,
      currency: "INR",
      receipt: order.id,
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { paymentRef: razorpayOrder.id },
    });

    res.json({
      keyId: process.env.RAZORPAY_KEY_ID,
      razorpayOrderId: razorpayOrder.id,
      amount: total,
      currency: "INR",
      dbOrderId: order.id,
    });
  } catch (err) {
    next(err);
  }
}

export async function verifyPayment(req, res, next) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: "Missing payment verification fields" });
    }

    const order = await prisma.order.findUnique({
      where: { paymentRef: razorpay_order_id },
    });

    if (!order || order.userId !== req.user.id) {
      return res.status(404).json({ error: "Order not found" });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: "Invalid payment signature" });
    }

    if (order.status === "PENDING") {
      await finalizeOrder(order.id);
      if (order.couponCode) {
        await prisma.coupon.update({
          where: { code: order.couponCode },
          data: { usedCount: { increment: 1 } },
        }).catch(() => {});
      }
    }

    const updated = await prisma.order.findUnique({
      where: { id: order.id },
      include: { items: { include: { product: true } } },
    });

    res.json({ order: updated });
  } catch (err) {
    next(err);
  }
}
