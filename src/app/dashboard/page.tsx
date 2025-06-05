"use client"; // Indica que este componente será renderizado no cliente (Next.js)

import { useEffect, useState } from "react";// Hooks para estado e efeitos colaterais
import { useRouter } from "next/navigation";// Hook para navegação no Next.js
import { FaEdit, FaTrash, FaCheck, FaUndo, FaUserCircle, FaSignOutAlt  } from "react-icons/fa"; // Tipos personalizados para metas


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

const API_BASE = "http://localhost:4000";

function useAuth() {
  const router = useRouter();// Permite direcionara para outra rota
  const [token, setToken] = useState<string | null>(null); // Estado local para armazenar o token de autenticação

  useEffect(() => {
    const storedToken = localStorage.getItem("token"); // Busca o token salvo no armazenamento local
    if (!storedToken) {
      router.push("/"); // Se não houver token, redireciona o usuário para a página de login
    } else {
      setToken(storedToken);  // Se houver, atualiza o estado local
    }
  }, [router]); // Executa o efeito quando o componente monta (ou se o router mudar)


  const logout = () => {
    localStorage.removeItem("token");  // Remove o token do localStorage
    router.push("/"); // Redireciona para a página inicial/login
  };

  return { token, logout };  // Retorna o token atual e a função de logout para ser usado em componentes
}

function Report({ token }: { token: string }) {
  const [report, setReport] = useState<ReportData | null>(null); // Armazena os dados do relatório
  const [loading, setLoading] = useState(true); // Controla o estado de carregamento
  const [error, setError] = useState<string | null>(null);  // Armazena uma mensagem de erro (se houver)

  useEffect(() => {
    setLoading(true); // Indica que o carregamento está em andamento
    fetch(`${API_BASE}/report`, {
      headers: { Authorization: `Bearer ${token}` }, // Envia o token no cabeçalho da requisição
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Erro ao carregar relatório"); // Lança erro com mensagem personalizada
        }
        return res.json(); // Converte a resposta em JSON
      })
      .then((data) => {
        setReport(data); // Atualiza o estado com os dados recebidos
        setError(null); // Limpa erros anteriores
      })
      .catch((err) => {
        setError(err.message); // Captura e armazena o erro para exibição
      })
      .finally(() => setLoading(false)); // Finaliza o carregamento (independente do sucesso ou erro)
  }, [token]);  // Dispara a cada mudança no token (em geral, apenas uma vez)

  if (loading)
    return (
      <div className="text-gray-600 font-medium">Carregando relatório...</div>
    );// Exibe mensagem de carregamento
  if (error)
    return <div className="text-red-600 font-semibold">Erro: {error}</div>;  // Exibe mensagem de erro
  if (!report)
    return <div className="text-gray-500">Nenhum dado no relatório.</div>; // Caso raro: sem erro, mas também sem dados

  return (
    <section className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm border-t-4 border-[#1E3A5F]">
      <h2 className="text-[#1E3A5F] text-2xl font-bold mb-4">
        Relatório de {report.name}
      </h2>
      <ul className="text-gray-700 space-y-2">
        <li>
          <strong>Total de metas:</strong> {report.total_goals}
        </li>
        <li>
          <strong>Concluídas:</strong> {report.completed_goals}
        </li>
        <li>
          <strong>Pendentes:</strong> {report.pending_goals}
        </li>
        <li>
          <strong>Concluído:</strong> {report.completion_percentage}%
        </li>
      </ul>
    </section>
  );
}

export default function DashboardPage() {
  const router = useRouter(); // Hook do Next.js para redirecionamento de rotas
  const { token, logout } = useAuth(); // Hook personalizado que retorna o token e função de logout

  const [goals, setGoals] = useState<Goal[]>([]); // Lista de metas do usuário
  const [title, setTitle] = useState(""); // Campo de título para nova meta
  const [description, setDescription] = useState(""); // Campo de descrição para nova meta
  const [editingGoalId, setEditingGoalId] = useState<number | null>(null); // ID da meta sendo editada
  const [editTitle, setEditTitle] = useState(""); // Título da meta em edição
  const [editDescription, setEditDescription] = useState(""); // Descrição da meta em edição
  const [filter, setFilter] = useState<"all" | "completed" | "pending">("all");  // Filtro de exibição das metas

  useEffect(() => {
    if (!token) return; // Só carrega se o token existir

    fetch(`${API_BASE}/goals`, {
      headers: { Authorization: `Bearer ${token}` },  // Envia token no cabeçalho
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao carregar metas");
        return res.json();
      })
      .then((data) => setGoals(data)) // Atualiza o estado com as metas carregadas
      .catch(() => alert("Erro ao carregar metas")); // Alerta em caso de erro
  }, [token]);  // Executa quando o token estiver disponível

  const handleAdd = async () => {
    if (!title.trim()) {
      alert("Título é obrigatório");
      return;
    }

    const res = await fetch(`${API_BASE}/goals`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, description }), // Envia os dados da nova meta
    });

    if (!res.ok) {
      alert("Erro ao adicionar meta");
      return;
    }

    const newGoal = await res.json(); // Meta retornada do backend
    setGoals([newGoal, ...goals]); // Adiciona no início da lista
    setTitle("");  // Limpa os campos
    setDescription("");
  };

  // Aqui eu posso editar
  const startEdit = (goal: Goal) => {
    setEditingGoalId(goal.id);
    setEditTitle(goal.title);
    setEditDescription(goal.description);
  };

  const cancelEdit = () => {
    setEditingGoalId(null); // Cancela edição
    setEditTitle("");
    setEditDescription("");
  };

  //Para salvar uma meta é obrigatório um título
  const saveEdit = async (goalId: number) => {
    if (!editTitle.trim()) {
      alert("Título é obrigatório");
      return;
    }

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

    cancelEdit();  // Encerra o modo de edição
  };

  // Alternar status de conclusão da meta
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

  // Remover meta
  const removeGoal = async (goalId: number) => {
    if (!confirm("Tem certeza que deseja deletar esta meta?")) return;

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

  // Aplicar filtro nas metas
  const filteredGoals = goals.filter((goal) => {
    if (filter === "completed") return goal.completed;
    if (filter === "pending") return !goal.completed;
    return true;
  });
 // Tela de carregamento se o token ainda não estiver disponível
  if (!token) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-600 font-semibold">
        Carregando...
      </div>
    );
  }

  return (
    <>
      <nav className="flex justify-between items-center bg-white px-8 py-4 shadow-md">
  <h1 className="text-3xl font-bold text-[#1E3A5F]">Painel de Metas</h1>
  <div className="flex gap-4">
    <button
      onClick={() => router.push("/dashboard/profile")}
      className="flex items-center gap-2  text-[#1E3A5F] px-5 py-2.5 rounded-full font-semibold transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2"
    >
      <FaUserCircle className="text-lg" />
      Meu Perfil
    </button>
    <button
      onClick={logout}
      className="flex items-center gap-2  text-[#da1c1c] px-5 py-2.5 rounded-full font-semibold transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2"
    >
      <FaSignOutAlt className="text-lg" />
      Sair
    </button>
  </div>
</nav>

      <main className="min-h-screen bg-gray-100 p-8 flex justify-center">
        <div className="max-w-7xl w-full flex flex-col md:flex-row gap-8">
          {/* Área das metas */}
          <section className="bg-white rounded-2xl shadow-xl p-8 flex-grow">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <h2 className="text-3xl font-extrabold text-[#1E3A5F] mb-4 md:mb-0">
                Minhas Metas
              </h2>
              <div className="flex gap-4 flex-wrap">
                {["all", "completed", "pending"].map((key) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key as any)}
                    className={`px-4 py-2 rounded-full font-semibold transition ${
                      filter === key
                        ? key === "completed"
                          ? "bg-green-600 text-white"
                          : key === "pending"
                          ? "bg-yellow-500 text-white"
                          : "bg-[#1E3A5F] text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {key === "all"
                      ? "Todas"
                      : key === "completed"
                      ? "Concluídas"
                      : "Pendentes"}
                  </button>
                ))}
              </div>
            </div>

            {/* Formulário para adicionar meta */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <input
                type="text"
                placeholder="Título da meta"
                className="flex-grow border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <input
                type="text"
                placeholder="Descrição (opcional)"
                className="flex-grow border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <button
                onClick={handleAdd}
                className="bg-[#1E3A5F] text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-[#16324B] transition"
              >
                Adicionar
              </button>
            </div>

            {/* Lista de metas */}
            <div className="flex flex-col gap-6">
              {filteredGoals.length === 0 && (
                <p className="text-gray-500 text-center">Nenhuma meta encontrada.</p>
              )}
              {filteredGoals.map((goal) =>
                editingGoalId === goal.id ? (
                  <div
                    key={goal.id}
                    className="bg-white p-6 rounded-xl shadow-md border-l-4 border-[#1E3A5F] flex flex-col gap-4"
                  >
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
                    />
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
                      rows={3}
                    />
                    <div className="flex gap-4">
                      <button
                        onClick={() => saveEdit(goal.id)}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md shadow transition font-semibold"
                      >
                        <FaCheck /> Salvar
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex items-center gap-2 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md shadow transition font-semibold"
                      >
                        <FaUndo /> Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    key={goal.id}
                    className={`bg-white p-6 rounded-xl shadow-md border-l-4 ${
                      goal.completed
                        ? "border-green-500 opacity-80"
                        : "border-[#1E3A5F]"
                    } flex flex-col md:flex-row md:justify-between md:items-center gap-4`}
                  >
                    <div>
                      <h3
                        className={`text-xl font-semibold ${
                          goal.completed ? "line-through text-green-600" : ""
                        }`}
                      >
                        {goal.title}
                      </h3>
                      <p
                        className={`mt-1 text-gray-700 ${
                          goal.completed ? "line-through" : ""
                        }`}
                      >
                        {goal.description || "—"}
                      </p>
                    </div>
                    <div className="flex gap-3 flex-wrap justify-end">
                      <button
                        onClick={() => toggleCompleted(goal)}
                        title={
                          goal.completed
                            ? "Marcar como pendente"
                            : "Marcar como concluída"
                        }
                        className={`p-2 rounded-md text-white shadow-md transition ${
                          goal.completed
                            ? "bg-yellow-500 hover:bg-yellow-600"
                            : "bg-green-600 hover:bg-green-700"
                        }`}
                      >
                        {goal.completed ? <FaUndo /> : <FaCheck />}
                      </button>
                      <button
                        onClick={() => startEdit(goal)}
                        title="Editar meta"
                        className="p-2 rounded-md bg-[#1E3A5F] hover:bg-[#16324B] text-white shadow-md transition"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => removeGoal(goal.id)}
                        title="Deletar meta"
                        className="p-2 rounded-md bg-red-600 hover:bg-red-700 text-white shadow-md transition"
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
          {token && <Report token={token} />}
        </div>
      </main>
    </>
  );
}
