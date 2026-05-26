"use client";

import { useState } from "react";
import { useToast } from "@/components/providers/ToastProvider";
import { apiUrl } from "@/lib/api/client";

export default function ContactPage() {
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Name is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      next.email = "Enter a valid email.";
    if (message.trim().length < 10)
      next.message = "Message must be at least 10 characters.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      const res = await fetch(apiUrl("/api/contact"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      if (!res.ok) throw new Error("Failed");
      showToast({ message: "Message sent! We'll reply within 24 hours.", variant: "success" });
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      showToast({ message: "Something went wrong", variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-12 lg:px-8">
      <h1 className="font-display text-4xl font-semibold">Contact Us</h1>
      <p className="mt-2 text-sm text-[var(--brand-text-muted)]">
        Questions about ingredients, orders, or wholesale? We typically respond within
        one business day.
      </p>
      <form onSubmit={submit} className="mt-8 space-y-4">
        <label className="block text-sm font-medium">
          Name
          <input
            className="mt-1 w-full border border-[var(--brand-border)] px-3 py-3 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {errors.name && (
            <span className="text-xs text-red-600">{errors.name}</span>
          )}
        </label>
        <label className="block text-sm font-medium">
          Email
          <input
            type="email"
            className="mt-1 w-full border border-[var(--brand-border)] px-3 py-3 text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && (
            <span className="text-xs text-red-600">{errors.email}</span>
          )}
        </label>
        <label className="block text-sm font-medium">
          Message
          <textarea
            rows={5}
            className="mt-1 w-full border border-[var(--brand-border)] px-3 py-3 text-sm"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          {errors.message && (
            <span className="text-xs text-red-600">{errors.message}</span>
          )}
        </label>
        <button
          type="submit"
          disabled={loading}
          className="h-12 w-full bg-black text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Sending…" : "Send Message"}
        </button>
      </form>
    </div>
  );
}
