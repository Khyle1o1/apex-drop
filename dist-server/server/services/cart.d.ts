import type { AddCartItemBody, UpdateCartItemBody } from "../validators/cart.js";
export declare function getOrCreateCart(userId: string): Promise<{
    cart: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        promoCode: string | null;
    };
    items: {
        id: string;
        variantId: string;
        quantity: number;
        unitPrice: string;
        productName: string;
        variantName: string | null;
        size: string | null;
        color: string | null;
        sku: string;
    }[];
    promoCode: string | null;
}>;
export declare function addItem(userId: string, body: AddCartItemBody): Promise<{
    cart: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        promoCode: string | null;
    };
    items: {
        id: string;
        variantId: string;
        quantity: number;
        unitPrice: string;
        productName: string;
        variantName: string | null;
        size: string | null;
        color: string | null;
        sku: string;
    }[];
    promoCode: string | null;
}>;
export declare function updateItem(userId: string, itemId: string, body: UpdateCartItemBody): Promise<{
    cart: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        promoCode: string | null;
    };
    items: {
        id: string;
        variantId: string;
        quantity: number;
        unitPrice: string;
        productName: string;
        variantName: string | null;
        size: string | null;
        color: string | null;
        sku: string;
    }[];
    promoCode: string | null;
}>;
export declare function removeItem(userId: string, itemId: string): Promise<{
    cart: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        promoCode: string | null;
    };
    items: {
        id: string;
        variantId: string;
        quantity: number;
        unitPrice: string;
        productName: string;
        variantName: string | null;
        size: string | null;
        color: string | null;
        sku: string;
    }[];
    promoCode: string | null;
}>;
export declare function applyPromo(userId: string, code: string): Promise<{
    cart: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        promoCode: string | null;
    };
    items: {
        id: string;
        variantId: string;
        quantity: number;
        unitPrice: string;
        productName: string;
        variantName: string | null;
        size: string | null;
        color: string | null;
        sku: string;
    }[];
    promoCode: string | null;
}>;
export declare function removePromo(userId: string): Promise<{
    cart: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        promoCode: string | null;
    };
    items: {
        id: string;
        variantId: string;
        quantity: number;
        unitPrice: string;
        productName: string;
        variantName: string | null;
        size: string | null;
        color: string | null;
        sku: string;
    }[];
    promoCode: string | null;
}>;
//# sourceMappingURL=cart.d.ts.map