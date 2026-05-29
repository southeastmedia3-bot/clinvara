"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function AdminChromeHider() {
  const pathname = usePathname();

  useEffect(() => {
    const hidden = pathname.startsWith("/admin");
    document.querySelectorAll<HTMLElement>("[data-store-chrome]").forEach((node) => {
      node.style.display = hidden ? "none" : "";
    });
  }, [pathname]);

  return null;
}
