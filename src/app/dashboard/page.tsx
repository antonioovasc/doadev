"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaEdit, FaTrash, FaCheck, FaUndo, FaUserCircle, FaSignOutAlt } from "react-icons/fa";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type Goal = {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  category_id: number | null;
};

type Category = { id: number; name: string };

type ReportData = {
  name: string;
  total_goals: number;
  completed_goals: number;
  pending_goals: number;
  completion_percentage: number;
};

const API_BASE = "http://localhost:4000";


// Cores para o gráfico de pizza
const COLORS = ['#00C49F', '#FFBB28'];


function useAuth() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("token");
    if (!stored) router.push("/");
    else setToken(stored);
  }, [router]);

  const logout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  return { token, logout };
}

function Report({ token, goals }: { token: string, goals: Goal[] }) {
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/report`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then(setReport)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="text-gray-600">Carregando relatório…</div>;
  if (error) return <div className="text-red-600">Erro: {error}</div>;
  if (!report) return <div className="text-gray-500">Relatório vazio.</div>;

  // Dados para o gráfico de pizza, agora calculando a partir das metas
  const data = [
    { name: 'Concluídas', value: goals.filter((g) => g.completed).length },
    { name: 'Pendentes', value: goals.filter((g) => !g.completed).length },
  ];


  return (
    <section className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm border-t-4 border-[#1E3A5F]">
      <h2 className="text-[#1E3A5F] text-2xl font-bold mb-4">
        Relatório de {report.name}
      </h2>

      {/* Gráfico de Pizza */}
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            dataKey="value"
            isAnimationActive
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={90}
            label
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>

      <ul className="text-gray-700 space-y-2 mt-6">
        <li><strong>Total:</strong> {goals.length}</li> {/* Mostra o total de metas */}
        <li><strong>Concluídas:</strong> {data[0].value}</li>
        <li><strong>Pendentes:</strong> {data[1].value}</li>
        <li><strong>Concluído:</strong> {(data[0].value / goals.length * 100).toFixed(2)}%</li> {/* Percentual de Concluídas */}
      </ul>

    </section>
  );
}



export default function DashboardPage() {
  const router = useRouter();
  const { token, logout } = useAuth();

  const [goals, setGoals] = useState<Goal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const [editingGoalId, setEditingGoalId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategoryId, setEditCategoryId] = useState<number | null>(null);

  const [filter, setFilter] = useState<"all" | "completed" | "pending">("all");

  useEffect(() => {
    if (!token) return;

    // goals
    fetch(`${API_BASE}/goals`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setGoals)
      .catch(() => alert("Erro ao carregar metas"));

    // categories
    fetch(`${API_BASE}/categories`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setCategories)
      .catch(() => alert("Erro ao carregar categorias"));
  }, [token]);

  //const do filtro de categoria
  const [categoryFilter, setCategoryFilter] = useState<number | "all">("all");

  const handleAdd = async () => {
    if (!title.trim()) return alert("Título é obrigatório");
    const res = await fetch(`${API_BASE}/goals`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        description,
        category_id: selectedCategory,
      }),
    });
    if (!res.ok) return alert("Erro ao adicionar meta");
    const newGoal = await res.json();
    setGoals([newGoal, ...goals]);
    setTitle("");
    setDescription("");
    setSelectedCategory(null);
  };

  const startEdit = (g: Goal) => {
    setEditingGoalId(g.id);
    setEditTitle(g.title);
    setEditDescription(g.description);
    setEditCategoryId(g.category_id);
  };

  const cancelEdit = () => {
    setEditingGoalId(null);
    setEditTitle("");
    setEditDescription("");
    setEditCategoryId(null);
  };


  const saveEdit = async (id: number) => {
    if (!editTitle.trim()) return alert("Título é obrigatório");
    const res = await fetch(`${API_BASE}/goals/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: editTitle,
        description: editDescription,
        category_id: editCategoryId,
        completed: goals.find((g) => g.id === id)?.completed,
      }),
    });
    if (!res.ok) return alert("Erro ao editar");
    setGoals((old) =>
      old.map((g) =>
        g.id === id
          ? {
            ...g,
            title: editTitle,
            description: editDescription,
            category_id: editCategoryId,
          }
          : g
      )
    );
    cancelEdit();
  };

  const toggleCompleted = async (g: Goal) => {
    await fetch(`${API_BASE}/goals/${g.id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: g.title,
        description: g.description,
        category_id: g.category_id,
        completed: !g.completed,
      }),
    });
    setGoals((old) =>
      old.map((t) =>
        t.id === g.id ? { ...t, completed: !t.completed } : t
      )
    );
  };

  const removeGoal = async (id: number) => {
    if (!confirm("Deletar meta?")) return;
    await fetch(`${API_BASE}/goals/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setGoals((old) => old.filter((g) => g.id !== id));
  };



  const filteredGoals = goals.filter(g => {
    const statusMatch =
      filter === "completed" ? g.completed :
        filter === "pending" ? !g.completed : true;

    const categoryMatch =
      categoryFilter === "all" ? true :
        categoryFilter === g.category_id;

    return statusMatch && categoryMatch;
  });


  if (!token)
    return (
      <div className="flex items-center justify-center h-screen text-gray-600 font-semibold">
        Carregando...
      </div>
    );

  return (
    <>
      <nav className="flex justify-between items-center bg-white px-8 py-4 shadow-md">
        <h1 className="text-3xl font-bold text-[#1E3A5F]">Painel de Metas</h1>
        <div className="flex gap-4">
          <button
            onClick={() => router.push("/dashboard/categories")}
            className="flex items-center gap-2 text-[#1E3A5F] px-5 py-2.5 rounded-full font-semibold shadow-md hover:shadow-lg"
          >
            Categorias
          </button>

          <button
            onClick={() => router.push("/dashboard/profile")}
            className="flex items-center gap-2 text-[#1E3A5F] px-5 py-2.5 rounded-full font-semibold shadow-md hover:shadow-lg"
          >
            <FaUserCircle /> Meu Perfil
          </button>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-[#da1c1c] px-5 py-2.5 rounded-full font-semibold shadow-md hover:shadow-lg"
          >
            <FaSignOutAlt /> Sair
          </button>
        </div>
      </nav>

      <main className="min-h-screen bg-gray-100 p-8 flex justify-center">
        <div className="max-w-7xl w-full flex flex-col md:flex-row gap-8">
          {/* Metas */}
          <section className="bg-white rounded-2xl shadow-xl p-8 flex-grow">
            <div className="flex flex-col md:flex-row md:justify-between mb-6">
              <h2 className="text-3xl font-extrabold text-[#1E3A5F] mb-4 md:mb-0">
                Minhas Metas
              </h2>
              <div className="flex gap-4">
                {["all", "completed", "pending"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f as any)}
                    className={`px-4 py-2 rounded-full font-semibold ${filter === f
                      ? f === "completed"
                        ? "bg-green-600 text-white"
                        : f === "pending"
                          ? "bg-yellow-500 text-white"
                          : "bg-[#1E3A5F] text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                  >
                    {f === "all"
                      ? "Todas"
                      : f === "completed"
                        ? "Concluídas"
                        : "Pendentes"}
                  </button>


                ))}
              </div>
              <select
                className="border rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#1E3A5F]"
                value={categoryFilter}
                onChange={e =>
                  setCategoryFilter(e.target.value === "all" ? "all" : +e.target.value)
                }
              >
                <option value="all">Todas as categorias</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

            </div>

            {/* Formulário */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <input
                className="flex-grow border rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#1E3A5F]"
                placeholder="Título"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <input
                className="flex-grow border rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#1E3A5F]"
                placeholder="Descrição"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <select
                className="border rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#1E3A5F]"
                value={selectedCategory ?? ""}
                onChange={(e) =>
                  setSelectedCategory(e.target.value ? +e.target.value : null)
                }
              >
                <option value="">Sem categoria</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <button
                onClick={handleAdd}
                className="bg-[#1E3A5F] text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-[#16324B]"
              >
                Adicionar
              </button>
            </div>

            {/* Lista */}
            <div className="flex flex-col gap-6">
              {filteredGoals.length === 0 && (
                <p className="text-gray-500 text-center">Nenhuma meta.</p>
              )}
              {filteredGoals.map((g) =>
                editingGoalId === g.id ? (
                  <div
                    key={g.id}
                    className="bg-white p-6 rounded-xl shadow-md border-l-4 border-[#1E3A5F] flex flex-col gap-4"
                  >
                    <input
                      className="border rounded-md px-4 py-2 focus:ring-2 focus:ring-[#1E3A5F]"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                    />
                    <textarea
                      className="border rounded-md px-4 py-2 focus:ring-2 focus:ring-[#1E3A5F]"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows={3}
                    />
                    <select
                      className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#1E3A5F]"
                      value={editCategoryId ?? ""}
                      onChange={(e) =>
                        setEditCategoryId(e.target.value ? +e.target.value : null)
                      }
                    >
                      <option value="">Sem categoria</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <div className="flex gap-4">
                      <button
                        onClick={() => saveEdit(g.id)}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md shadow hover:bg-green-700"
                      >
                        <FaCheck /> Salvar
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex items-center gap-2 bg-gray-300 text-gray-800 px-4 py-2 rounded-md shadow hover:bg-gray-400"
                      >
                        <FaUndo /> Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    key={g.id}
                    className={`bg-white p-6 rounded-xl shadow-md border-l-4 ${g.completed ? "border-green-500 opacity-80" : "border-[#1E3A5F]"
                      } flex-col md:flex-row md:justify-between md:items-center gap-4 flex`}
                  >
                    <div>
                      <h3
                        className={`text-xl font-semibold ${g.completed ? "line-through text-green-600" : ""
                          }`}
                      >
                        {g.title}
                      </h3>
                      <p className={`${g.completed ? "line-through" : ""} mt-1`}>
                        {g.description || "—"}
                      </p>
                      {g.category_id !== null && (
                        <p className="text-sm text-gray-500 mt-1">
                          Categoria:{" "}
                          {
                            categories.find((c) => c.id === g.category_id)
                              ?.name
                          }
                        </p>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => toggleCompleted(g)}
                        className={`p-2 rounded-md text-white shadow ${g.completed
                          ? "bg-yellow-500 hover:bg-yellow-600"
                          : "bg-green-600 hover:bg-green-700"
                          }`}
                      >
                        {g.completed ? <FaUndo /> : <FaCheck />}
                      </button>
                      <button
                        onClick={() => startEdit(g)}
                        className="p-2 rounded-md bg-[#1E3A5F] hover:bg-[#16324B] text-white"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => removeGoal(g.id)}
                        className="p-2 rounded-md bg-red-600 hover:bg-red-700 text-white"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          </section>

          {/* Relatório */}
          {token && <Report token={token} goals={goals} />}

        </div>
      </main>
    </>
  );
}
