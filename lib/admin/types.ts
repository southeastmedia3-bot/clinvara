import type { Product } from "@/lib/types";

export type AdminRole = "admin";

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

export type AdminProduct = Product & {
  stock?: number;
  availability?: StockStatus;
  lowStockThreshold?: number;
  seoTitle?: string;
  seoDescription?: string;
  updatedAt?: unknown;
};

export type OrderStatus =
  | "pending_admin_confirmation"
  | "confirmed"
  | "packed"
  | "picked_up"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "refunded"
  | "rejected";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded" | "not_connected";

export type AdminOrder = {
  id: string;
  orderId?: string;
  userId?: string;
  uid?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  checkoutEmail?: string;
  email?: string;
  address?: unknown;
  shippingAddress?: unknown;
  products?: unknown[];
  items?: unknown[];
  totalAmount?: number;
  subtotal?: number;
  paymentStatus?: PaymentStatus | string;
  orderStatus?: OrderStatus | string;
  status?: string;
  adminNotes?: string;
  adminDecision?: "pending" | "accepted" | "rejected";
  publicOrderStatus?: string;
  rejectionReason?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type AdminCustomer = {
  id: string;
  uid?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  pincode?: string;
  addresses?: unknown[];
  role?: AdminRole | string;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type AdminCoupon = {
  id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minimumOrderValue: number;
  expiryDate: string;
  usageLimit: number;
  active: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type AdminReview = {
  id: string;
  productSlug?: string;
  productName?: string;
  customerName?: string;
  rating?: number;
  title?: string;
  body?: string;
  status?: "pending" | "approved" | "rejected";
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type StoreSettings = {
  id?: string;
  storeName: string;
  supportEmail: string;
  supportPhone: string;
  shippingCharge: number;
  freeShippingThreshold: number;
  announcementBarText: string;
  homepageBannerText: string;
  socialLinks: {
    instagram: string;
    facebook: string;
    youtube: string;
    threads: string;
  };
  updatedAt?: unknown;
};

export type AdminStats = {
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  totalProducts: number;
  lowStockProducts: number;
};
