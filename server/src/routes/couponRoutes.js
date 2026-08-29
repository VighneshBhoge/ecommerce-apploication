import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { validateCoupon, listCoupons, createCoupon, deleteCoupon } from "../controllers/couponController.js";

const router = Router();

router.post("/validate", requireAuth, validateCoupon);

router.get("/", requireAuth, requireAdmin, listCoupons);
router.post("/", requireAuth, requireAdmin, createCoupon);
router.delete("/:id", requireAuth, requireAdmin, deleteCoupon);

export default router;
