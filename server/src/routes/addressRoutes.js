import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { getAddresses, createAddress, updateAddress, deleteAddress } from "../controllers/addressController.js";

const router = Router();

router.use(requireAuth);

router.get("/", getAddresses);
router.post("/", createAddress);
router.put("/:id", updateAddress);
router.delete("/:id", deleteAddress);

export default router;
