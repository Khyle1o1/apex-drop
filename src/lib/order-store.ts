import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from './cart-store';
import type { UserProfile } from './auth-store';

export type OrderStatus =
  | 'pending_payment'
  | 'payment_verification'
  | 'paid_for_pickup'
  | 'claimed_completed'
  | 'cancelled';

export interface Order {
  id: string;
  transactionReference: string;
  createdAt: string;
  status: OrderStatus;
  buyerName: string;
  buyerEmail: string;
  buyerIdNumber: string;
  address: string;
  notes?: string;
  items: CartItem[];
  subtotal: number;
  pickupLocation: string;
  receiptFileName?: string;
  receiptNumber?: string;
}

interface OrderState {
  orders: Order[];
  createOrder: (payload: {
    user: UserProfile;
    items: CartItem[];
    subtotal: number;
    notes?: string;
  }) => Order;
  submitReceipt: (id: string, payload: { receiptFileName: string; receiptNumber?: string }) => void;
  updateStatus: (id: string, status: OrderStatus) => void;
  getOrdersForEmail: (email: string) => Order[];
  getOrderByReference: (ref: string) => Order | undefined;
}

const PICKUP_LOCATION = 'University Economic Enterprise Unit';

const generateReference = (index: number) => {
  const padded = String(index).padStart(6, '0');
  const year = new Date().getFullYear();
  return `CMERCH-${year}-${padded}`;
};

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: [],
      createOrder: ({ user, items, subtotal, notes }) => {
        const index = get().orders.length + 1;
        const transactionReference = generateReference(index);
        const id = `${Date.now()}-${index}`;
        const order: Order = {
          id,
          transactionReference,
          createdAt: new Date().toISOString(),
          status: 'pending_payment',
          buyerName: user.fullName,
          buyerEmail: user.email,
          buyerIdNumber: user.idNumber,
          address: user.address,
          notes,
          items,
          subtotal,
          pickupLocation: PICKUP_LOCATION,
        };
        set((state) => ({ orders: [order, ...state.orders] }));
        return order;
      },
      submitReceipt: (id, { receiptFileName, receiptNumber }) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === id
              ? {
                  ...o,
                  receiptFileName,
                  receiptNumber,
                  status: 'payment_verification',
                }
              : o
          ),
        }));
      },
      updateStatus: (id, status) => {
        set((state) => ({
          orders: state.orders.map((o) => (o.id === id ? { ...o, status } : o)),
        }));
      },
      getOrdersForEmail: (email) => get().orders.filter((o) => o.buyerEmail === email),
      getOrderByReference: (ref) => get().orders.find((o) => o.transactionReference === ref),
    }),
    {
      name: 'apex-orders',
    }
  )
);

