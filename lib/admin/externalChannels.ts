"use client";

import { collection, getDocs } from "firebase/firestore";
import { firebaseDb } from "@/lib/firebase/client";
import type { ExternalChannel, ExternalChannelId } from "@/lib/admin/types";

const defaultChannelIds: ExternalChannelId[] = [
  "amazon",
  "flipkart",
  "blinkit",
  "zepto",
  "swiggy-instamart",
  "flipkart-minutes",
  "jiomart",
  "bigbasket",
];

const channelNames: Record<ExternalChannelId, string> = {
  amazon: "Amazon",
  flipkart: "Flipkart",
  blinkit: "Blinkit",
  zepto: "Zepto",
  "swiggy-instamart": "Swiggy Instamart",
  "flipkart-minutes": "Flipkart Minutes",
  jiomart: "JioMart",
  bigbasket: "BigBasket",
};

export const externalChannelCollections = {
  channels: "externalChannels",
  products: "externalChannelProducts",
  inventory: "externalChannelInventory",
  orders: "externalChannelOrders",
  revenue: "externalChannelRevenue",
  returns: "externalChannelReturns",
  settlements: "externalChannelSettlements",
} as const;

function emptyChannel(id: ExternalChannelId): ExternalChannel {
  return {
    id,
    name: channelNames[id],
    marketplaceName: channelNames[id],
    sellerAccountStatus: "awaiting_onboarding",
    apiStatus: "not_configured",
    inventorySyncStatus: "not_configured",
    orderSyncStatus: "not_configured",
    connectionStatus: "not_connected",
    products: 0,
    orders: 0,
    revenue: 0,
    inventory: 0,
    returns: 0,
    settlementStatus: "no_data",
    lastSync: "",
  };
}

export const defaultExternalChannels = defaultChannelIds.map(emptyChannel);

export async function listExternalChannels(): Promise<ExternalChannel[]> {
  const snapshot = await getDocs(collection(firebaseDb, externalChannelCollections.channels)).catch(
    () => null,
  );
  if (!snapshot?.docs.length) return defaultExternalChannels;

  const saved = new Map(
    snapshot.docs.map((entry) => [
      entry.id,
      {
        ...emptyChannel(entry.id as ExternalChannelId),
        ...(entry.data() as Partial<ExternalChannel>),
        id: entry.id as ExternalChannelId,
      },
    ]),
  );

  return defaultExternalChannels.map((channel) => ({
    ...channel,
    ...(saved.get(channel.id) || {}),
  }));
}
