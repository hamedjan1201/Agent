"use client";

import { useState } from "react";

type Restaurant = {
  name: string;
  vibe: string;
  estimatedPrice: string;
  address: string;
  reason: string;
  link: string;
  rating?: string;
};

export default function Home() {
  const [input, setInput] = useState("romantic dinner under $100 in SF");
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSearch() {
    setLoading(true);
    setRestaurants([]);

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: input }),
      });

      const data = await res.json();
      setRestaurants(data.restaurants || []);
    } catch {
      setRestaurants([]);
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white px-6 py-12">
      <section className="max-w-4xl mx-auto">
        <div className="mb-10 text-center">
          <p className="text-sm text-pink-300 mb-2">AI Concierge for San Francisco</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            AI Date Night Finder
          </h1>
          <p className="text-neutral-300 max-w-2xl mx-auto">
            Tell the agent your vibe, budget, and location. It returns 3 clear,
            date-ready restaurant options with links and reasoning.
          </p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-xl">
          <div className="flex flex-col md:flex-row gap-3">
            <input
              className="flex-1 bg-neutral-950 border border-neutral-700 rounded-xl px-4 py-3 outline-none focus:border-pink-400"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Example: romantic dinner under $100 in SF"
            />

            <button
              onClick={handleSearch}
              disabled={loading}
              className="bg-pink-500 hover:bg-pink-600 disabled:bg-neutral-700 text-white font-semibold px-6 py-3 rounded-xl transition"
            >
              {loading ? "Searching..." : "Find"}
            </button>
          </div>

          {loading && (
            <div className="mt-5 text-sm text-neutral-300">
              Analyzing vibe, price, location, and date-night fit...
            </div>
          )}
        </div>

        {restaurants.length > 0 && (
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {restaurants.map((restaurant, index) => (
              <div
                key={index}
                className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-lg"
              >
                <div className="mb-3">
                  <span className="text-xs bg-pink-500/20 text-pink-300 px-3 py-1 rounded-full">
                    Option {index + 1}
                  </span>
                </div>

                <h2 className="text-2xl font-bold mb-2">{restaurant.name}</h2>

                <p className="text-yellow-400 text-sm mb-2">
                  {restaurant.rating || "4.5⭐"}
                </p>

                <p className="text-sm text-neutral-300 mb-3">
                  {restaurant.vibe}
                </p>

                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-neutral-500">Estimated Price</p>
                    <p>{restaurant.estimatedPrice}</p>
                  </div>

                  <div>
                    <p className="text-neutral-500">Address</p>
                    <p>{restaurant.address}</p>
                  </div>

                  <div>
                    <p className="text-neutral-500">Why it works</p>
                    <p>{restaurant.reason}</p>
                  </div>
                </div>

                <a
                  href={restaurant.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 block text-center bg-white text-black font-semibold py-2 rounded-xl hover:bg-neutral-200 transition"
                >
                  Open Link
                </a>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}