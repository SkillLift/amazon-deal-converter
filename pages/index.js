
import { useState } from "react";

export default function Home() {
  const [user, setUser] = useState("user1");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleConvert = async () => {
    setLoading(true);
    const res = await fetch("/api/shorten", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: input, user })
    });
    const data = await res.json();
    setOutput(data.cleanedText);
    setLoading(false);
  };

  return (
    <main className="min-h-screen p-6 bg-gray-100 text-gray-800">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Amazon Deal Link Cleaner</h1>

        <label className="block mb-2 font-medium">Select User</label>
        <select
          className="mb-4 p-2 border rounded w-full"
          value={user}
          onChange={(e) => setUser(e.target.value)}
        >
          <option value="user1">User 1 (mns-d-21)</option>
          <option value="user2">User 2 (bb-uk-01-21)</option>
          <option value="user3">User 3 (ws-t3-21)</option>
        </select>

        <textarea
          className="w-full p-4 border rounded mb-4"
          rows="10"
          placeholder="Paste your deals here..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={handleConvert}
          disabled={loading}
        >
          {loading ? "Processing..." : "Clean & Convert"}
        </button>

        {output && (
          <>
            <h2 className="mt-6 mb-2 font-semibold">Cleaned Deals:</h2>
            <textarea
              className="w-full p-4 border rounded"
              rows="10"
              value={output}
              readOnly
            />
          </>
        )}
      </div>
    </main>
  );
}
