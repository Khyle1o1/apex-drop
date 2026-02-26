import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { validateBody, validateParams } from "../middleware/validate.js";
import { addCartItemSchema, updateCartItemSchema, cartItemIdParamSchema, applyPromoSchema, } from "../validators/cart.js";
import * as cartService from "../services/cart.js";
const router = Router();
router.use(authMiddleware);
router.get("/", async (req, res, next) => {
    try {
        const data = await cartService.getOrCreateCart(req.user.id);
        res.json(data);
    }
    catch (e) {
        next(e);
    }
});
router.post("/items", validateBody(addCartItemSchema), async (req, res, next) => {
    try {
        const data = await cartService.addItem(req.user.id, req.body);
        res.json(data);
    }
    catch (e) {
        next(e);
    }
});
router.patch("/items/:id", validateParams(cartItemIdParamSchema), validateBody(updateCartItemSchema), async (req, res, next) => {
    try {
        const data = await cartService.updateItem(req.user.id, req.params.id, req.body);
        res.json(data);
    }
    catch (e) {
        next(e);
    }
});
router.delete("/items/:id", validateParams(cartItemIdParamSchema), async (req, res, next) => {
    try {
        const data = await cartService.removeItem(req.user.id, req.params.id);
        res.json(data);
    }
    catch (e) {
        next(e);
    }
});
router.post("/apply-promo", validateBody(applyPromoSchema), async (req, res, next) => {
    try {
        const data = await cartService.applyPromo(req.user.id, req.body.code);
        res.json(data);
    }
    catch (e) {
        next(e);
    }
});
router.delete("/promo", async (req, res, next) => {
    try {
        const data = await cartService.removePromo(req.user.id);
        res.json(data);
    }
    catch (e) {
        next(e);
    }
});
export default router;
//# sourceMappingURL=cart.js.map