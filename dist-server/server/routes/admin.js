import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/auth.js";
import { validateParams, validateBody, validateQuery } from "../middleware/validate.js";
import { orderIdParamSchema, adminOrdersQuerySchema, updateOrderStatusSchema, verifyPaymentSchema, productIdParamSchema, variantIdParamSchema, updateVariantInventorySchema, } from "../validators/admin.js";
import * as adminService from "../services/admin.js";
const router = Router();
router.use(authMiddleware, requireAdmin);
router.get("/dashboard", async (_req, res, next) => {
    try {
        const data = await adminService.getDashboard();
        res.json(data);
    }
    catch (e) {
        next(e);
    }
});
router.get("/products", async (_req, res, next) => {
    try {
        const data = await adminService.listProductsAdmin();
        res.json(data);
    }
    catch (e) {
        next(e);
    }
});
router.get("/products/:id/variants", validateParams(productIdParamSchema), async (req, res, next) => {
    try {
        const data = await adminService.getProductVariantsAdmin(req.params.id);
        res.json(data);
    }
    catch (e) {
        next(e);
    }
});
router.patch("/variants/:id", validateParams(variantIdParamSchema), validateBody(updateVariantInventorySchema), async (req, res, next) => {
    try {
        const updated = await adminService.updateVariantInventoryAdmin(req.params.id, req.body);
        res.json(updated);
    }
    catch (e) {
        next(e);
    }
});
router.get("/orders", validateQuery(adminOrdersQuerySchema), async (req, res, next) => {
    try {
        const data = await adminService.listOrdersAdmin(req.query);
        res.json(data);
    }
    catch (e) {
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
    }
    catch (e) {
        next(e);
    }
});
router.patch("/orders/:id/status", validateParams(orderIdParamSchema), validateBody(updateOrderStatusSchema), async (req, res, next) => {
    try {
        const order = await adminService.updateOrderStatus(req.params.id, req.body.status);
        res.json(order);
    }
    catch (e) {
        next(e);
    }
});
router.patch("/orders/:id/verify-payment", validateParams(orderIdParamSchema), validateBody(verifyPaymentSchema), async (req, res, next) => {
    try {
        const order = await adminService.verifyPayment(req.params.id, req.user.id, req.body);
        res.json(order);
    }
    catch (e) {
        next(e);
    }
});
router.get("/reports/sales-summary", async (_req, res, next) => {
    try {
        const data = await adminService.getSalesSummary();
        res.json(data);
    }
    catch (e) {
        next(e);
    }
});
router.get("/reports/top-products", async (req, res, next) => {
    try {
        const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit), 10) || 10));
        const data = await adminService.getTopProducts(limit);
        res.json(data);
    }
    catch (e) {
        next(e);
    }
});
export default router;
//# sourceMappingURL=admin.js.map