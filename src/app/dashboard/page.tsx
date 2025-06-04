"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Goal = {
  id: number;
  title: string;
  description: string;
  completed: boolean;
};

type ReportData = {
  name: string;
  total_goals: number;
  completed_goals: number;
  pending_goals: number;
  completion_percentage: number;
};

function useAuth() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      router.push("/");
    } else {
      setToken(storedToken);
    }
  }, [router]);

  const logout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  return { token, logout };
}

function Report({ token, apiBase }: { token: string; apiBase: string }) {
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${apiBase}/report`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Erro ${res.status}: ${errorText || "Erro ao carregar relatório"}`);
        }
        return res.json();
      })
      .then((data) => {
        setReport(data);
        setError(null);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [token, apiBase]);

  if (loading) return <p className="text-gray-600">Carregando relatório...</p>;
  if (error) return <p className="text-red-600">Erro: {error}</p>;
  if (!report) return <p>Nenhum dado disponível.</p>;

  return (
    <section className="bg-white p-6 rounded-xl shadow-md w-full max-w-sm">
      <h2 className="text-2xl font-bold mb-4 text-[#1E3A5F]">Relatório de {report.name}</h2>
      <ul className="space-y-2 text-gray-700">
        <li><strong>Total de metas:</strong> {report.total_goals}</li>
        <li><strong>Concluídas:</strong> {report.completed_goals}</li>
        <li><strong>Pendentes:</strong> {report.pending_goals}</li>
        <li><strong>Concluído:</strong> {report.completion_percentage}%</li>
      </ul>
    </section>
  );
}

export default function DashboardPage() {
  const { token, logout } = useAuth();

  const [goals, setGoals] = useState<Goal[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingGoalId, setEditingGoalId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const API_BASE = "http://localhost:4000";

  useEffect(() => {
    if (!token) return;

    fetch(`${API_BASE}/goals`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao carregar metas");
        return res.json();
      })
      .then((data) => setGoals(data))
      .catch(() => alert("Erro ao carregar metas"));
  }, [token]);

  const handleAdd = async () => {
    if (!title.trim()) return alert("Título é obrigatório");

    const res = await fetch(`${API_BASE}/goals`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
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
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
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
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
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
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      alert("Erro ao deletar meta");
      return;
    }

    setGoals((oldGoals) => oldGoals.filter((goal) => goal.id !== goalId));
  };

  if (!token) return <div className="p-8 text-center text-gray-600">Carregando...</div>;

  return (
    <>
      <nav className="w-full bg-white shadow-md px-8 py-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#1E3A5F]">Painel de Metas</h2>
        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md"
        >
          Sair
        </button>
      </nav>

      <main className="min-h-screen bg-gray-100 p-8 flex flex-col items-center">
        <div className="w-full max-w-7xl flex flex-col md:flex-row gap-8">
          {/* Metas */}
          <section className="w-full md:w-3/4 bg-white rounded-2xl shadow-xl p-8">
            <h1 className="text-3xl font-extrabold mb-6 text-[#1E3A5F]">Minhas Metas</h1>

            {/* Formulário */}
            <div className="mb-8 space-y-4">
              <input
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
                placeholder="Título da Meta"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <textarea
                className="w-full rounded-lg border border-gray-300 px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
                placeholder="Descrição"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <button
                onClick={handleAdd}
                className="w-full bg-[#1E3A5F] hover:bg-[#16324B] text-white font-semibold py-3 rounded-lg transition"
              >
                Adicionar Meta
              </button>
            </div>

            {/* Lista de Metas */}
            <ul className="space-y-6">
              {goals.map((goal) => (
                <li
                  key={goal.id}
                  className={`p-5 rounded-xl shadow-md flex flex-col md:flex-row justify-between items-start md:items-center
                    ${
                      goal.completed
                        ? "bg-gray-100 border border-green-400"
                        : "bg-white border border-gray-200"
                    }`}
                >
                  {editingGoalId === goal.id ? (
                    <div className="w-full space-y-3">
                      <input
                        className="w-full rounded-md border border-gray-300 px-4 py-2"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                      />
                      <textarea
                        className="w-full rounded-md border border-gray-300 px-4 py-2"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => saveEdit(goal.id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                        >
                          Salvar
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <h3 className={`text-lg font-semibold ${goal.completed ? "line-through text-gray-500" : ""}`}>
                          {goal.title}
                        </h3>
                        <p className={`text-sm ${goal.completed ? "line-through text-gray-500" : ""}`}>
                          {goal.description}
                        </p>
                      </div>
                      <div className="flex flex-col md:flex-row md:items-center gap-2 mt-3 md:mt-0">
                        <label className="flex items-center gap-2 text-sm font-medium text-[#1E3A5F]">
                          <input
                            type="checkbox"
                            checked={goal.completed}
                            onChange={() => toggleCompleted(goal)}
                            className="accent-[#1E3A5F] w-4 h-4"
                          />
                          Concluído
                        </label>
                        <button
                          onClick={() => startEdit(goal)}
                          className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded-lg"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => removeGoal(goal.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg"
                        >
                          Deletar
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </section>

          {/* Relatório */}
          <Report token={token} apiBase={API_BASE} />
        </div>
      </main>
    </>
  );
}
