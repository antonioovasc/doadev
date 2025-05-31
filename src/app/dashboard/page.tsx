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

  const [editingGoalId, setEditingGoalId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const API_BASE = "http://localhost:4000";

  useEffect(() => {
    fetch(`${API_BASE}/goals`)
      .then((res) => res.json())
      .then((data) => setGoals(data))
      .catch(() => alert("Erro ao carregar metas"));
  }, []);

  const handleAdd = async () => {
    if (!title.trim()) return alert("Título é obrigatório");

    const res = await fetch(`${API_BASE}/goals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
    });

    if (!res.ok) {
      alert("Erro ao adicionar meta");
      return;
    }

    const newGoal = await res.json();
    setGoals([newGoal, ...goals]);
    setTitle("");
    setDescription("");
  };

  const startEdit = (goal: Goal) => {
    setEditingGoalId(goal.id);
    setEditTitle(goal.title);
    setEditDescription(goal.description);
  };

  const cancelEdit = () => {
    setEditingGoalId(null);
    setEditTitle("");
    setEditDescription("");
  };

  const saveEdit = async (goalId: number) => {
    if (!editTitle.trim()) return alert("Título é obrigatório");

    const res = await fetch(`${API_BASE}/goals/${goalId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editTitle,
        description: editDescription,
        completed: goals.find((g) => g.id === goalId)?.completed || false,
      }),
    });

    if (!res.ok) {
      alert("Erro ao atualizar meta");
      return;
    }

    setGoals((oldGoals) =>
      oldGoals.map((goal) =>
        goal.id === goalId
          ? { ...goal, title: editTitle, description: editDescription }
          : goal
      )
    );

    cancelEdit();
  };

  const toggleCompleted = async (goal: Goal) => {
    const res = await fetch(`${API_BASE}/goals/${goal.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: goal.title,
        description: goal.description,
        completed: !goal.completed,
      }),
    });

    if (!res.ok) {
      alert("Erro ao atualizar status da meta");
      return;
    }

    setGoals((oldGoals) =>
      oldGoals.map((g) =>
        g.id === goal.id ? { ...g, completed: !g.completed } : g
      )
    );
  };

  const removeGoal = async (goalId: number) => {
    const confirmed = confirm("Tem certeza que deseja deletar esta meta?");
    if (!confirmed) return;

    const res = await fetch(`${API_BASE}/goals/${goalId}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      alert("Erro ao deletar meta");
      return;
    }

    setGoals((oldGoals) => oldGoals.filter((goal) => goal.id !== goalId));
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-8 flex justify-center">
      <section className="w-full max-w-4xl bg-white rounded-3xl shadow-xl p-8">
        <h1 className="text-4xl font-extrabold mb-8 text-center text-gradient bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 bg-clip-text text-transparent">
          Minhas Metas
        </h1>

        {/* Formulário de adicionar meta */}
        <div className="mb-10 space-y-4">
          <input
            className="w-full rounded-xl border border-gray-300 px-5 py-3 focus:outline-none focus:ring-4 focus:ring-purple-300 transition"
            placeholder="Título da Meta"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="w-full rounded-xl border border-gray-300 px-5 py-3 resize-none focus:outline-none focus:ring-4 focus:ring-purple-300 transition"
            placeholder="Descrição"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button
            onClick={handleAdd}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-pink-600 hover:to-purple-600 text-white font-semibold py-3 rounded-xl shadow-lg transition"
          >
            Adicionar Meta
          </button>
        </div>

        {/* Lista de metas */}
        <ul className="space-y-6">
          {goals.map((goal) => (
            <li
              key={goal.id}
              className={`p-6 rounded-2xl shadow-lg flex flex-col md:flex-row md:justify-between md:items-center transition 
                ${
                  goal.completed
                    ? "bg-gradient-to-r from-green-200 via-green-100 to-green-200"
                    : "bg-white hover:shadow-2xl"
                }`}
            >
              {editingGoalId === goal.id ? (
                <div className="flex flex-col w-full space-y-3">
                  <input
                    className="rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-4 focus:ring-purple-300 transition"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    autoFocus
                  />
                  <textarea
                    className="rounded-lg border border-gray-300 px-4 py-2 resize-none focus:outline-none focus:ring-4 focus:ring-purple-300 transition"
                    rows={3}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                  />
                  <div className="flex justify-end space-x-4 mt-2">
                    <button
                      onClick={() => saveEdit(goal.id)}
                      className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg shadow-md transition"
                    >
                      Salvar
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold px-6 py-2 rounded-lg shadow-md transition"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-1 mb-4 md:mb-0">
                    <h2
                      className={`text-2xl font-semibold mb-2 ${
                        goal.completed
                          ? "line-through text-gray-500 italic"
                          : "text-gray-800"
                      }`}
                    >
                      {goal.title}
                    </h2>
                    <p
                      className={`text-gray-600 ${
                        goal.completed ? "line-through italic" : ""
                      }`}
                    >
                      {goal.description || "Sem descrição"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3 md:flex-col md:gap-2 items-center">
                    <button
                      onClick={() => toggleCompleted(goal)}
                      className={`px-5 py-2 rounded-full font-semibold text-white shadow-md transition
                      ${
                        goal.completed
                          ? "bg-yellow-500 hover:bg-yellow-600"
                          : "bg-green-600 hover:bg-green-700"
                      }`}
                      title={
                        goal.completed
                          ? "Desmarcar como concluída"
                          : "Marcar como concluída"
                      }
                    >
                      {goal.completed ? "Desmarcar" : "Concluir"}
                    </button>

                    <button
                      onClick={() => startEdit(goal)}
                      className="px-5 py-2 rounded-full font-semibold text-purple-600 border border-purple-600 hover:bg-purple-600 hover:text-white transition shadow-md"
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => removeGoal(goal.id)}
                      className="px-5 py-2 rounded-full font-semibold text-red-600 border border-red-600 hover:bg-red-600 hover:text-white transition shadow-md"
                    >
                      Remover
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
