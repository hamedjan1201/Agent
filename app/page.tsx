"use client";

import { useState } from "react";

export default function Home() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");

  const handleSearch = async () => {
    const res = await fetch("/api/search", {
      method: "POST",
      body: JSON.stringify({ query: input }),
    });

    const data = await res.json();
    setResult(data.result);
  };

  return (
    <div className="p-10 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        AI Date Night Finder (SF)
      </h1>

      <input
        className="border p-2 w-full mb-4"
        placeholder="Romantic dinner under $100"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <button
        className="bg-black text-white px-4 py-2"
        onClick={handleSearch}
      >
        Find
      </button>

      <div className="mt-6 whitespace-pre-wrap">
        {result}
      </div>
    </div>
  );
}