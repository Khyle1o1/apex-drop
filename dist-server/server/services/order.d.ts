export declare function checkout(userId: string, opts: {
    notes?: string;
    promoCode?: string;
}): Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    promoCode: string | null;
    orderRef: string;
    status: string;
    subtotal: string;
    discountTotal: string;
    total: string;
    pickupLocation: string;
    paymentInstructions: string;
    notes: string | null;
    paidAt: Date | null;
    claimedAt: Date | null;
}>;
export declare function listOrders(userId: string): Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    promoCode: string | null;
    orderRef: string;
    status: string;
    subtotal: string;
    discountTotal: string;
    total: string;
    pickupLocation: string;
    paymentInstructions: string;
    notes: string | null;
    paidAt: Date | null;
    claimedAt: Date | null;
}[]>;
export declare function getOrder(userId: string, orderId: string): Promise<{
    items: {
        id: string;
        variantId: string | null;
        quantity: number;
        unitPrice: string;
        orderId: string;
        productNameSnapshot: string;
        variantSnapshot: Record<string, unknown> | null;
        lineTotal: string;
    }[];
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    promoCode: string | null;
    orderRef: string;
    status: string;
    subtotal: string;
    discountTotal: string;
    total: string;
    pickupLocation: string;
    paymentInstructions: string;
    notes: string | null;
    paidAt: Date | null;
    claimedAt: Date | null;
} | null>;
export declare function submitPayment(userId: string, orderId: string, body: {
    referenceNo?: string;
    proofImageUrl?: string;
}): Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    promoCode: string | null;
    orderRef: string;
    status: string;
    subtotal: string;
    discountTotal: string;
    total: string;
    pickupLocation: string;
    paymentInstructions: string;
    notes: string | null;
    paidAt: Date | null;
    claimedAt: Date | null;
}>;
//# sourceMappingURL=order.d.ts.map