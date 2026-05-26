export function apiUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "";
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (base && normalized.startsWith("/api/")) {
    return `${base}${normalized.slice(4)}`;
  }
  return `${base}${normalized}`;
}
