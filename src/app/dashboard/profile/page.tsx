"use client"; // Indica que este componente será renderizado no client-side (Next.js 13+)

// Importa hooks do React para estado e efeitos colaterais
import { useEffect, useState } from "react";
// Importa o hook de navegação do Next.js
import { useRouter } from "next/navigation";

// URL base da API para as requisições
const API_BASE = "http://localhost:4000";

export default function ProfilePage() {
  const router = useRouter(); // Inicializa o roteador para navegação programática
  // Estados para armazenar token, dados do perfil e controle da UI
  const [token, setToken] = useState<string | null>(null);
  const [name, setName] = useState(""); // Nome do usuário
  const [email, setEmail] = useState(""); // Email do usuário
  const [isEditing, setIsEditing] = useState(false); // Controle se o formulário está em modo edição
  const [message, setMessage] = useState(""); // Mensagens de feedback para o usuário

  // useEffect para carregar os dados do perfil quando o componente monta
  useEffect(() => {
    // Recupera o token armazenado no localStorage
    const storedToken = localStorage.getItem("token");

    // Se não houver token, redireciona para a página inicial (login)
    if (!storedToken) {
      router.push("/");
      return;
    }

    // Salva o token no estado
    setToken(storedToken);

    // Faz a requisição para buscar os dados do perfil do usuário
    fetch(`${API_BASE}/profile`, {
      headers: { Authorization: `Bearer ${storedToken}` }, // Envia token no header para autenticação
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao carregar perfil"); // Tratamento de erro
        return res.json();
      })
      .then((data) => {
        // Atualiza estados com os dados recebidos da API
        setName(data.name);
        setEmail(data.email);
      })
      .catch(() => setMessage("Erro ao carregar perfil")); // Mensagem de erro na UI
  }, []); // Dependências vazias para executar só uma vez ao montar

  // Função para salvar as alterações feitas no perfil
  const handleSave = async () => {
    if (!token) return;

    try {
      const resProfile = await fetch(`${API_BASE}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email }), // Envia nome e email para a atualização
      });

      if (!resProfile.ok) {
        setMessage("Erro ao atualizar nome e email");
        return;
      }

      setMessage("Perfil atualizado com sucesso!");
      setIsEditing(false); // Desativa o modo de edição
    } catch {
      setMessage("Erro ao atualizar perfil"); // Mensagem de erro na UI
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-8 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-extrabold text-[#1E3A5F] mb-6 text-center">Meu Perfil</h1>

        {/* Nome */}
        <label className="block mb-4">
          <span className="text-gray-700">Nome</span>
          <input
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!isEditing} // Desabilita se não estiver em modo edição
          />
        </label>

        {/* E-mail */}
        <label className="block mb-4">
          <span className="text-gray-700">Email</span>
          <input
            type="email"
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={!isEditing} // Desabilita se não estiver em modo edição
          />
        </label>

        {/* Botões para editar ou salvar */}
        {!isEditing ? (
          <>
            <button
              onClick={() => {
                setIsEditing(true);
                setMessage(""); // Limpa qualquer mensagem anterior
              }}
              className="bg-[#1E3A5F] text-white w-full py-3 rounded-md font-semibold hover:bg-[#16324B] mb-4"
            >
              Editar
            </button>

            <button
              onClick={() => router.push("/dashboard")} // Redireciona para o painel
              className="bg-gray-400 text-white w-full py-3 rounded-md font-semibold hover:bg-gray-500"
            >
              Voltar para o painel
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleSave} // Salva as alterações no perfil
              className="bg-[#1E3A5F] text-white w-full py-3 rounded-md font-semibold hover:bg-[#16324B] mb-4"
            >
              Salvar Alterações
            </button>

            <button
              onClick={() => {
                setIsEditing(false); // Cancela a edição
                setMessage(""); // Limpa qualquer mensagem
                if (token) {
                  // Recupera os dados originais se o usuário cancelar
                  fetch(`${API_BASE}/profile`, {
                    headers: { Authorization: `Bearer ${token}` },
                  })
                    .then((res) => res.json())
                    .then((data) => {
                      setName(data.name);
                      setEmail(data.email);
                    });
                }
              }}
              className="bg-gray-400 text-white w-full py-3 rounded-md font-semibold hover:bg-gray-500"
            >
              Cancelar
            </button>
          </>
        )}

        {/* Exibe mensagem de feedback */}
        {message && (
          <p className="mt-4 text-center text-green-600 font-medium">{message}</p>
        )}
      </div>
    </main>
  );
}
