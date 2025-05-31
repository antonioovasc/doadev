"use client";

import { useEffect, useState } from "react";

type Goal = {
  id: number;
  title: string;
  description: string;
  completed: boolean;
};

export default function DashboardPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    fetch("/api/goals")
      .then((res) => res.json())
      .then((data) => setGoals(data));
  }, []);

  const handleAdd = async () => {
    const res = await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
    });
    const newGoal = await res.json();
    setGoals([...goals, newGoal]);
    setTitle("");
    setDescription("");
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Minhas Metas</h1>

      <div className="mb-6 space-y-2">
        <input
          className="border p-2 w-full"
          placeholder="Título da Meta"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="border p-2 w-full"
          placeholder="Descrição"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button onClick={handleAdd} className="bg-blue-600 text-white px-4 py-2 rounded">
          Adicionar Meta
        </button>
      </div>

      <ul className="space-y-4">
        {goals.map((goal) => (
          <li key={goal.id} className="border p-4 rounded shadow-sm">
            <h2 className="text-lg font-semibold">{goal.title}</h2>
            <p className="text-gray-600">{goal.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
