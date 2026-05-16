import { NextResponse } from "next/server";

const fallbackRestaurants = [
  {
    name: "Nopa",
    vibe: "Warm, rustic-chic, lively but intimate",
    estimatedPrice: "$75–$95 per person",
    address: "560 Divisadero St, San Francisco, CA 94117",
    reason:
      "Great for conversation, special food without being too formal, and a cozy date-night atmosphere.",
    link: "https://nopasf.com/reservations",
    rating: "4.6⭐",
  },
  {
    name: "El Techo",
    vibe: "Rooftop, skyline views, fun and energetic",
    estimatedPrice: "$65–$85 per person",
    address: "2516 Mission St, San Francisco, CA 94110",
    reason:
      "Great sunset views, shareable plates, and a memorable first-date vibe.",
    link: "https://www.eltechosf.com/",
    rating: "4.4⭐",
  },
  {
    name: "Marlowe",
    vibe: "Soft lighting, polished but relaxed brasserie",
    estimatedPrice: "$70–$90 per person",
    address: "500 Brannan St, San Francisco, CA 94107",
    reason:
      "Comfortable booth seating, strong food, and a calm setting for real conversation.",
    link: "https://www.marlowesf.com/",
    rating: "4.5⭐",
  },
];

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!process.env.QWEN_API_KEY || !process.env.QWEN_BASE_URL) {
      return NextResponse.json({ restaurants: fallbackRestaurants });
    }

    const response = await fetch(`${process.env.QWEN_BASE_URL}/chat/completions`, {
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

Return exactly 3 restaurants.

Rules:
- Include "rating" like "4.5⭐"
- Keep everything clean and simple
- Use real-looking SF restaurants
            `,
          },
          {
            role: "user",
            content: query,
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ restaurants: fallbackRestaurants });
    }

    const text = data.choices?.[0]?.message?.content;

    try {
      const parsed = JSON.parse(text);

      const restaurants = parsed.restaurants.map((r: any) => ({
        ...r,
        rating: r.rating || "4.5⭐",
      }));

      return NextResponse.json({ restaurants });
    } catch {
      return NextResponse.json({ restaurants: fallbackRestaurants });
    }
  } catch {
    return NextResponse.json({ restaurants: fallbackRestaurants });
  }
}