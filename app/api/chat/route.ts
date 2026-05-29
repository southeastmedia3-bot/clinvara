import { NextResponse } from "next/server";
import { getStorefrontProducts } from "@/lib/firebase/products";

type ChatMessage = {
  role: "assistant" | "user";
  text: string;
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const messages = (body?.messages ?? []) as ChatMessage[];
  const latest = messages[messages.length - 1]?.text?.trim();

  if (!latest) {
    return NextResponse.json({ error: "Please enter a question." }, { status: 400 });
  }

  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json(
      {
        error:
          "AI chat is not configured. Add GROQ_API_KEY to .env.local and restart the dev server.",
      },
      { status: 503 },
    );
  }

  let response: Response;
  try {
    const products = await getStorefrontProducts();
    const productContext = products
      .map(
        (product) =>
          `${product.name}: ${product.description} Concerns: ${product.concerns.join(
            ", ",
          )}. Price: INR ${product.price}. Slug: /shop/${product.slug}. Ingredients: ${product.ingredients}`,
      )
      .join("\n");

    response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `You are CLINVARA Assist, a professional skincare and ecommerce concierge for the CLINVARA website.
Answer general questions naturally and helpfully, but keep skincare advice careful and non-medical.
Do not diagnose conditions, promise cures, or replace a dermatologist.
When a CLINVARA product is relevant, recommend from this catalog and include the product page path.
Keep answers concise, polished, and useful for a premium minimalist skincare brand.

Catalog:
${productContext}`,
          },
          ...messages.slice(-10).map((message) => ({
            role: message.role,
            content: message.text,
          })),
        ],
        max_completion_tokens: 450,
        temperature: 0.5,
      }),
    });
  } catch {
    return NextResponse.json(
      {
        error:
          "The server could not reach Groq. Check your internet connection and restart the dev server.",
      },
      { status: 502 },
    );
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const providerMessage =
      data?.error?.message || data?.message || data?.error || response.statusText;
    return NextResponse.json(
      { error: `Groq error (${response.status}): ${providerMessage}` },
      { status: response.status },
    );
  }

  return NextResponse.json({
    answer:
      data?.choices?.[0]?.message?.content?.trim() ||
      "I could not generate a clear answer just now. Please try again.",
  });
}
