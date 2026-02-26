import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/auth.js";
import { validateParams, validateBody, validateQuery } from "../middleware/validate.js";
import {
  orderIdParamSchema,
  adminOrdersQuerySchema,
  updateOrderStatusSchema,
  verifyPaymentSchema,
  productIdParamSchema,
  createProductSchema,
  updateProductSchema,
  variantSizeIdParamSchema,
  updateInventoryStockSchema,
  updateVariantSizeStatusSchema,
} from "../validators/admin.js";
import * as adminService from "../services/admin.js";

const router = Router();
router.use(authMiddleware, requireAdmin);

// ─── Dashboard ────────────────────────────────────────────────────────────────

router.get("/dashboard", async (_req, res, next) => {
  try {
    const data = await adminService.getDashboard();
    res.json(data);
  } catch (e) {
    next(e);
  }
});

// ─── Categories ───────────────────────────────────────────────────────────────

router.get("/categories", async (_req, res, next) => {
  try {
    const data = await adminService.listCategoriesAdmin();
    res.json(data);
  } catch (e) {
    next(e);
  }
});

router.post("/categories", async (req, res, next) => {
  try {
    const data = await adminService.createCategoryAdmin(req.body);
    res.status(201).json(data);
  } catch (e) {
    next(e);
  }
});

router.delete("/categories/:id", async (req, res, next) => {
  try {
    await adminService.deleteCategoryAdmin(req.params.id);
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

// ─── Products ─────────────────────────────────────────────────────────────────

router.get("/products", async (_req, res, next) => {
  try {
    const data = await adminService.listProductsAdmin();
    res.json(data);
  } catch (e) {
    next(e);
  }
});

router.post("/products", validateBody(createProductSchema), async (req, res, next) => {
  try {
    const product = await adminService.createProductAdmin(req.body);
    res.status(201).json(product);
  } catch (e) {
    next(e);
  }
});

router.get("/products/:id", validateParams(productIdParamSchema), async (req, res, next) => {
  try {
    const product = await adminService.getProductAdmin(req.params.id);
    if (!product) {
      res.status(404).json({ error: { message: "Product not found", code: "NOT_FOUND" } });
      return;
    }
    res.json(product);
  } catch (e) {
    next(e);
  }
});

router.put(
  "/products/:id",
  validateParams(productIdParamSchema),
  validateBody(updateProductSchema),
  async (req, res, next) => {
    try {
      const product = await adminService.updateProductAdmin(req.params.id, req.body);
      res.json(product);
    } catch (e) {
      next(e);
    }
  }
);

router.delete("/products/:id", validateParams(productIdParamSchema), async (req, res, next) => {
  try {
    await adminService.deleteProductAdmin(req.params.id);
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

// ─── Inventory ────────────────────────────────────────────────────────────────

router.get("/inventory", async (_req, res, next) => {
  try {
    const data = await adminService.listInventoryAdmin();
    res.json(data);
  } catch (e) {
    next(e);
  }
});

router.patch(
  "/inventory/:variantSizeId/stock",
  validateParams(variantSizeIdParamSchema),
  validateBody(updateInventoryStockSchema),
  async (req, res, next) => {
    try {
      const data = await adminService.updateInventoryAdmin(req.params.variantSizeId, req.body.stock);
      res.json(data);
    } catch (e) {
      next(e);
    }
  }
);

router.patch(
  "/inventory/:variantSizeId/status",
  validateParams(variantSizeIdParamSchema),
  validateBody(updateVariantSizeStatusSchema),
  async (req, res, next) => {
    try {
      const data = await adminService.updateVariantSizeStatusAdmin(
        req.params.variantSizeId,
        req.body.isActive
      );
      res.json(data);
    } catch (e) {
      next(e);
    }
  }
);

// ─── Users ────────────────────────────────────────────────────────────────────

router.get("/users", async (_req, res, next) => {
  try {
    const data = await adminService.listUsersAdmin();
    res.json(data);
  } catch (e) {
    next(e);
  }
});

// ─── Orders ───────────────────────────────────────────────────────────────────

router.get("/orders", validateQuery(adminOrdersQuerySchema), async (req, res, next) => {
  try {
    const data = await adminService.listOrdersAdmin(req.query);
    res.json(data);
  } catch (e) {
    next(e);
  }
});

router.get("/orders/:id", validateParams(orderIdParamSchema), async (req, res, next) => {
  try {
    const order = await adminService.getOrderAdmin(req.params.id);
    if (!order) {
      res.status(404).json({ error: { message: "Order not found", code: "NOT_FOUND" } });
      return;
    }
    res.json(order);
  } catch (e) {
    next(e);
  }
});

router.patch(
  "/orders/:id/status",
  validateParams(orderIdParamSchema),
  validateBody(updateOrderStatusSchema),
  async (req, res, next) => {
    try {
      const order = await adminService.updateOrderStatus(req.params.id, req.body.status);
      res.json(order);
    } catch (e) {
      next(e);
    }
  }
);

router.patch(
  "/orders/:id/verify-payment",
  validateParams(orderIdParamSchema),
  validateBody(verifyPaymentSchema),
  async (req, res, next) => {
    try {
      const order = await adminService.verifyPayment(req.params.id, req.user!.id, req.body);
      res.json(order);
    } catch (e) {
      next(e);
    }
  }
);

// ─── Reports ──────────────────────────────────────────────────────────────────

router.get("/reports/sales-summary", async (_req, res, next) => {
  try {
    const data = await adminService.getSalesSummary();
    res.json(data);
  } catch (e) {
    next(e);
  }
});

router.get("/reports/top-products", async (req, res, next) => {
  try {
    const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit), 10) || 10));
    const data = await adminService.getTopProducts(limit);
    res.json(data);
  } catch (e) {
    next(e);
  }
});

export default router;
