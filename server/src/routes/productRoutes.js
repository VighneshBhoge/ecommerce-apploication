import { Router } from "express";
import { getProducts, getProductById, autocomplete, getBrands } from "../controllers/productController.js";

const router = Router();

router.get("/autocomplete", autocomplete);
router.get("/brands", getBrands);
router.get("/", getProducts);
router.get("/:id", getProductById);

export default router;
