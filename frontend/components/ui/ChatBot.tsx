"use client";

import { useRef, useState } from "react";
import { Bot, Loader2, Send, Sparkles, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { apiUrl } from "@/lib/api/client";

type Message = {
  role: "assistant" | "user";
  text: string;
};

export function ChatBot() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Hi, I am CLINVARA Assist. Ask me anything about skincare, routines, ingredients, orders, or CLINVARA products.",
    },
  ]);
  const inputRef = useRef<HTMLInputElement>(null);

  const sendMessage = async () => {
    const text = draft.trim();
    if (!text || loading) return;

    const nextMessages: Message[] = [...messages, { role: "user", text }];
    setMessages(nextMessages);
    setDraft("");
    setLoading(true);

    const response = await fetch(apiUrl("/api/chat"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: nextMessages }),
    });
    const data = await response.json().catch(() => null);

    setMessages((current) => [
      ...current,
      {
        role: "assistant",
        text:
          response.ok && data?.answer
            ? data.answer
            : data?.error ?? "I could not answer that right now. Please try again.",
      },
    ]);
    setLoading(false);
    window.setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <>
      <button
        type="button"
        aria-label="Open skincare assistant"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-[140] flex h-14 w-14 items-center justify-center rounded-full bg-[var(--brand-primary)] text-white shadow-xl transition-transform hover:scale-105"
      >
        <Bot className="h-6 w-6" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.aside
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-4 z-[180] flex h-[min(620px,calc(100vh-120px))] w-[calc(100vw-32px)] max-w-[390px] flex-col border border-[var(--brand-border)] bg-white shadow-2xl sm:right-5"
          >
            <div className="flex items-center justify-between border-b border-[var(--brand-border)] px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--brand-off-white)]">
                  <Sparkles className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-bold">CLINVARA Assist</p>
                  <p className="text-[11px] text-[var(--brand-text-muted)]">
                    AI skincare concierge
                  </p>
                </div>
              </div>
              <button type="button" aria-label="Close assistant" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`max-w-[88%] whitespace-pre-line px-3 py-2 text-sm leading-relaxed ${
                    message.role === "user"
                      ? "ml-auto bg-[var(--brand-primary)] text-white"
                      : "bg-[var(--brand-off-white)] text-[var(--brand-primary)]"
                  }`}
                >
                  {message.text}
                </div>
              ))}
              {loading && (
                <div className="inline-flex items-center gap-2 bg-[var(--brand-off-white)] px-3 py-2 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Thinking
                </div>
              )}
            </div>

            <div className="border-t border-[var(--brand-border)] p-3">
              <form
                className="flex gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  void sendMessage();
                }}
              >
                <input
                  ref={inputRef}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Ask anything"
                  className="h-11 flex-1 border border-[var(--brand-border)] px-3 text-sm outline-none focus:border-black"
                />
                <button
                  type="submit"
                  aria-label="Send message"
                  className="flex h-11 w-11 items-center justify-center bg-[var(--brand-primary)] text-white disabled:opacity-50"
                  disabled={!draft.trim() || loading}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </form>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
