import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().optional(),
  price: z.number().int().positive("Price must be a positive integer in paise"),
  stock: z.number().int().min(0, "Stock cannot be negative").optional(),
  categoryId: z.string().min(1, "Category ID is required"),
  brand: z.string().optional(),
  imageUrl: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["CUSTOMER", "ADMIN"]).optional(),
  businessCode: z.string().optional(),
});

export const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(1, "Comment is required"),
});

export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const issue = result.error.issues[0];
      return res.status(400).json({
        error: issue ? `${issue.path.join(".")}: ${issue.message}` : "Validation error",
      });
    }
    req.body = result.data;
    next();
  };
}
