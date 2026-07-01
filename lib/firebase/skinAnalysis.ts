"use client";

import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  doc,
} from "firebase/firestore";
import { firebaseDb } from "@/lib/firebase/client";
import { saveCustomerProfile } from "@/lib/firebase/customerData";
import type { SkinAnalysisRecord } from "@/lib/skin-analysis/recommendations";

const HISTORY_LIMIT = 24;

function skinAnalysesRef(uid: string) {
  return collection(firebaseDb, "customers", uid, "skinAnalyses");
}

function stripUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map(stripUndefined) as T;
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, entry]) => entry !== undefined)
        .map(([key, entry]) => [key, stripUndefined(entry)]),
    ) as T;
  }

  return value;
}

export async function createSkinAnalysis(uid: string, record: SkinAnalysisRecord) {
  const payload = stripUndefined({
    ...record,
    recommendationVersion: record.recommendationVersion || "rules-v1",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  const ref = await addDoc(skinAnalysesRef(uid), payload);
  const savedRecord = { ...record, id: ref.id };

  await saveCustomerProfile(uid, {
    skinAnalysis: {
      latest: savedRecord,
    },
  });

  return savedRecord;
}

export async function listSkinAnalyses(uid: string) {
  const ref = skinAnalysesRef(uid);
  const snapshot = await getDocs(
    query(ref, orderBy("completedAt", "desc"), limit(HISTORY_LIMIT)),
  ).catch(() => getDocs(ref));

  return snapshot.docs
    .map((entry) => ({ id: entry.id, ...(entry.data() as SkinAnalysisRecord) }))
    .sort(
      (a, b) =>
        new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
    );
}

export async function updateSkinAnalysisNotes(
  uid: string,
  analysisId: string,
  notes: string,
) {
  await updateDoc(doc(firebaseDb, "customers", uid, "skinAnalyses", analysisId), {
    notes: notes.trim(),
    updatedAt: serverTimestamp(),
  });
}
