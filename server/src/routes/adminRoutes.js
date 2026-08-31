import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { upload } from "../lib/cloudinary.js";
import {
  getStats,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllOrders,
  updateOrderStatus,
  getCustomers,
  updateCustomerRole,
} from "../controllers/adminController.js";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/stats", getStats);

router.post("/products", upload.single("image"), createProduct);
router.put("/products/:id", upload.single("image"), updateProduct);
router.delete("/products/:id", deleteProduct);

router.get("/orders", getAllOrders);
router.patch("/orders/:id/status", updateOrderStatus);

router.get("/customers", getCustomers);
router.patch("/customers/:id/role", updateCustomerRole);

export default router;
