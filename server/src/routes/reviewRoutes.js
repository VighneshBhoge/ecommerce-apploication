import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { getProductReviews, upsertReview, deleteReview } from "../controllers/reviewController.js";

const router = Router();

router.get("/:id/reviews", getProductReviews);
router.post("/:id/reviews", requireAuth, upsertReview);
router.delete("/:id/reviews", requireAuth, deleteReview);

export default router;
