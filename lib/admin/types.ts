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
  | "waiting_confirmation"
  | "confirmed"
  | "packed"
  | "picked_up"
  | "in_transit"
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
  publicOrderId?: string;
  userId?: string;
  uid?: string;
  customerId?: string;
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
  confirmedAt?: unknown;
  packedAt?: unknown;
  pickedUpAt?: unknown;
  inTransitAt?: unknown;
  shippedAt?: unknown;
  outForDeliveryAt?: unknown;
  deliveredAt?: unknown;
  rejectedAt?: unknown;
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
  name?: string;
  rating?: number;
  title?: string;
  body?: string;
  status?: "pending" | "approved" | "rejected";
  date?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type AdminReturn = {
  id: string;
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  orderId?: string;
  orderDisplayId?: string;
  productId?: string;
  productSlug?: string;
  productName?: string;
  reason?: string;
  notes?: string;
  status?: string;
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

export type ExternalChannelId =
  | "amazon"
  | "flipkart"
  | "blinkit"
  | "zepto"
  | "swiggy-instamart"
  | "flipkart-minutes"
  | "jiomart"
  | "bigbasket";

export type ExternalChannelStatus = "not_connected" | "awaiting_onboarding" | "connected" | "paused";
export type ExternalSyncStatus = "not_configured" | "idle" | "syncing" | "failed" | "synced";
export type SettlementStatus = "no_data" | "pending" | "settled" | "action_required";

export type ExternalChannel = {
  id: ExternalChannelId;
  name: string;
  marketplaceName: string;
  sellerAccountStatus: ExternalChannelStatus;
  apiStatus: ExternalSyncStatus;
  inventorySyncStatus: ExternalSyncStatus;
  orderSyncStatus: ExternalSyncStatus;
  connectionStatus: ExternalChannelStatus;
  products: number;
  orders: number;
  revenue: number;
  inventory: number;
  returns: number;
  settlementStatus: SettlementStatus;
  lastSync?: string;
  updatedAt?: unknown;
};

export type ChannelProduct = {
  id: string;
  channelId: ExternalChannelId;
  productId: string;
  channelSku?: string;
  listingStatus: "draft" | "ready" | "live" | "paused" | "error";
  price?: number;
  inventory?: number;
  lastSync?: string;
};

export type ChannelOrder = {
  id: string;
  channelId: ExternalChannelId;
  externalOrderId: string;
  status: string;
  revenue?: number;
  createdAt?: unknown;
};

export type ChannelReturn = {
  id: string;
  channelId: ExternalChannelId;
  externalReturnId: string;
  status: string;
  createdAt?: unknown;
};

export type ChannelSettlement = {
  id: string;
  channelId: ExternalChannelId;
  status: SettlementStatus;
  amount?: number;
  settlementDate?: string;
};
