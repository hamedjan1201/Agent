import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    const hasBudget = /\$[0-9]+/.test(query || "");
    const budgetMatch = query?.match(/\$([0-9]+)/);
    const budget = budgetMatch ? Number(budgetMatch[1]) : null;

    if (budget !== null && budget < 10) {
      return NextResponse.json({
        restaurants: [
          {
            name: "Budget too low for restaurants",
            vibe: "Helpful suggestion",
            estimatedPrice: `Your budget: $${budget}`,
            address: "San Francisco, CA",
            reason:
              "A restaurant meal in SF is unlikely under this budget. Try increasing the budget to $15–$25, or search for coffee, snacks, or free public spots instead.",
            rating: "Budget Alert ⚠️",
          },
        ],
      });
    }

    if (!process.env.QWEN_API_KEY || !process.env.QWEN_BASE_URL) {
      return NextResponse.json({ restaurants: [] });
    }

    const response = await fetch(
      `${process.env.QWEN_BASE_URL}/chat/completions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.QWEN_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "qwen-plus",
          messages: [
            {
              role: "system",
              content: `
You are an AI date-night concierge for San Francisco.

Return ONLY valid JSON. No markdown. No explanation.

The JSON must be:
{
  "restaurants": [
    {
      "name": "",
      "vibe": "",
      "estimatedPrice": "",
      "address": "",
      "reason": "",
      "link": "",
      "rating": ""
    }
  ]
}

Rules:
- Return exactly 3 restaurants.
- Restaurants must be real in San Francisco.
- The "link" must be the official homepage if possible.
- The "link" must start with https://.
- "rating" should look like "4.5⭐".
- For estimatedPrice, use a real dollar range like "$40–$80", not "$$" or "$$$".
- Keep "reason" short and useful.
              `,
            },
            {
              role: "user",
              content: query,
            },
          ],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ restaurants: [] });
    }

    const text = data.choices?.[0]?.message?.content;

    try {
      const parsed = JSON.parse(text);

      const restaurants = parsed.restaurants.map((r: any) => ({
        name: r.name || "Unknown",
        vibe: r.vibe || "Nice atmosphere",
        estimatedPrice: (() => {
          if (!hasBudget) {
            return "Focus on the moment, not the price";
          }

          if (
            r.estimatedPrice &&
            r.estimatedPrice.includes("$") &&
            !r.estimatedPrice.includes("$$")
          ) {
            return r.estimatedPrice;
          }

          if (budget) {
            const min = Math.floor(budget * 0.4);
            const max = Math.floor(budget * 0.8);
            return `$${min}–$${max}`;
          }

          return "Depends on what you order";
        })(),
        address: r.address || "San Francisco",
        reason: r.reason || "Good choice",
        link:
          typeof r.link === "string" && r.link.startsWith("https://")
            ? r.link
            : `https://www.google.com/search?q=${encodeURIComponent(
                `${r.name || "restaurant"} San Francisco`
              )}`,
        rating: r.rating || "4.5⭐",
      }));

      return NextResponse.json({ restaurants });
    } catch {
      return NextResponse.json({ restaurants: [] });
    }
  } catch {
    return NextResponse.json({ restaurants: [] });
  }
}