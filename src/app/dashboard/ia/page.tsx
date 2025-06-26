"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE = "http://localhost:4000"; // Seu servidor local

export default function SuggestionsPage() {
    const router = useRouter();
    const [inputText, setInputText] = useState("");
    const [suggestion, setSuggestion] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const getSuggestion = async () => {
        if (!inputText.trim()) return;
        setLoading(true);

        const token = localStorage.getItem("token");
        if (!token) {
            alert("Você precisa estar logado!");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/suggestions`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ prompt: inputText.trim() }),
            });

            if (!res.ok) {
                const errorDetails = await res.text();  // Captura detalhes do erro enviado pela API
                throw new Error(`Erro ao obter sugestão. Detalhes: ${errorDetails}`);
            }

            const data = await res.json();
            setSuggestion(data.suggestion);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";

            setSuggestion(`Erro: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-gray-100 p-16 flex justify-center items-center">
            <div className="w-full max-w-4xl h-auto p-12 bg-white rounded-xl shadow-lg">
                <h1 className="text-3xl font-extrabold text-[#1E3A5F] mb-8 text-center">Sugestões da IA</h1>

                {/* Botão Voltar */}
                <button
                    onClick={() => router.push("/dashboard")}
                    className="mb-6 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded"
                >
                    ← Voltar para o painel
                </button>

                {/* Entrada de Texto */}
                <div className="flex gap-4 mb-10">
                    <input
                        type="text"
                        className="flex-grow border border-gray-300 rounded-lg px-5 py-3 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] transition"
                        placeholder="Digite sua solicitação..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && getSuggestion()}
                    />
                    <button
                        onClick={getSuggestion}
                        disabled={loading}  // Desabilita o botão enquanto está carregando
                        className={`bg-[#1E3A5F] hover:bg-[#163254] text-white font-semibold px-6 rounded-lg shadow-md transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? (
                            <span className="spinner-border spinner-border-sm"></span>  // Ícone de carregamento
                        ) : (
                            "Obter Sugestão"
                        )}
                    </button>
                </div>

                {/* Exibição da sugestão da IA */}
                {loading && <p className="text-center text-gray-500">Carregando...</p>}
                {suggestion && !loading && (
                    <div className="mt-8 p-6 bg-gray-50 rounded-lg shadow-sm">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">Sugestão:</h2>
                        <p className="text-gray-600">{suggestion}</p>
                    </div>
                )}
            </div>
        </main>
    );
}
