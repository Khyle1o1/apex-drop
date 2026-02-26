import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { validateBody, validateParams } from "../middleware/validate.js";
import { checkoutSchema, orderIdParamSchema, submitPaymentSchema } from "../validators/orders.js";
import * as orderService from "../services/order.js";

const router = Router();
router.use(authMiddleware);

router.post("/checkout", validateBody(checkoutSchema), async (req, res, next) => {
  try {
    const order = await orderService.checkout(req.user!.id, req.body);
    res.status(201).json(order);
  } catch (e) {
    next(e);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const list = await orderService.listOrders(req.user!.id);
    res.json(list);
  } catch (e) {
    next(e);
  }
});

router.get("/:id", validateParams(orderIdParamSchema), async (req, res, next) => {
  try {
    const order = await orderService.getOrder(req.user!.id, req.params.id);
    if (!order) {
      res.status(404).json({ error: { message: "Order not found", code: "NOT_FOUND" } });
      return;
    }
    res.json(order);
  } catch (e) {
    next(e);
  }
});

router.post(
  "/:id/payment/submit",
  validateParams(orderIdParamSchema),
  validateBody(submitPaymentSchema),
  async (req, res, next) => {
    try {
      const order = await orderService.submitPayment(req.user!.id, req.params.id, req.body);
      res.json(order);
    } catch (e) {
      next(e);
    }
  }
);

export default router;
