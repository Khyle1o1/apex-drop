export declare function listProductsAdmin(): Promise<{
    id: string;
    name: string;
    basePrice: string;
    isActive: boolean;
    categoryName: string | null;
}[]>;
export declare function getProductVariantsAdmin(productId: string): Promise<{
    id: string;
    sku: string;
    variantName: string | null;
    size: string | null;
    color: string | null;
    isActive: boolean;
    stock: number | null;
    reserved: number | null;
}[]>;
export declare function updateVariantInventoryAdmin(variantId: string, data: {
    stock?: number;
    isActive?: boolean;
}): Promise<{
    id: string;
    sku: string;
    variantName: string | null;
    size: string | null;
    color: string | null;
    isActive: boolean;
    stock: number | null;
    reserved: number | null;
}>;
export declare function getDashboard(): Promise<{
    totalSales: string;
    pendingPaymentVerification: number;
    totalOrders: number;
}>;
export declare function listOrdersAdmin(opts: {
    status?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
}): Promise<{
    list: {
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
    }[];
    total: number;
    page: number;
    limit: number;
}>;
export declare function getOrderAdmin(orderId: string): Promise<{
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
    payment: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        orderId: string;
        method: string;
        referenceNo: string | null;
        proofImageUrl: string | null;
        verifiedByAdminId: string | null;
        verifiedAt: Date | null;
    };
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
export declare function updateOrderStatus(orderId: string, status: string): Promise<{
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
export declare function verifyPayment(orderId: string, adminId: string, body: {
    approve: boolean;
    note?: string;
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
export declare function getSalesSummary(): Promise<{
    totalSales: string;
    orderCount: number;
}>;
export declare function getTopProducts(limit?: number): Promise<{
    productName: string;
    totalQuantity: number;
    totalRevenue: string;
}[]>;
//# sourceMappingURL=admin.d.ts.map