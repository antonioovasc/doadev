"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaEdit, FaTrash, FaSave, FaTimes } from "react-icons/fa";


const API_BASE = "http://localhost:4000";

type Category = { id: number; name: string };

export default function CategoriesPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("token");
    if (!stored) {
      router.push("/");
    } else {
      setToken(stored);
    }
  }, [router]);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/categories`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setCategories);
  }, [token]);

  const addCategory = async () => {
    if (!newCategory.trim()) return;
    const res = await fetch(`${API_BASE}/categories`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: newCategory.trim() }),
    });
    const data = await res.json();
    setCategories((prev) => [...prev, data]);
    setNewCategory("");
  };

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setEditingName(category.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  const saveEdit = async (id: number) => {
    if (!editingName.trim()) return;
    await fetch(`${API_BASE}/categories/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: editingName.trim() }),
    });
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name: editingName.trim() } : c))
    );
    cancelEdit();
  };

  const deleteCategory = async (id: number) => {
    if (!confirm("Deseja excluir esta categoria?")) return;
    await fetch(`${API_BASE}/categories/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  if (!token) return <p className="text-center mt-10 text-gray-500">Carregando...</p>;

  return (
    <div className="max-w-3xl mx-auto mt-12 p-8 bg-white rounded-xl shadow-lg">
      <h1 className="text-3xl font-extrabold text-[#1E3A5F] mb-8 text-center">Categorias</h1>

      {/* Botão Voltar */}
      <button
        onClick={() => router.push("/dashboard")}
        className="mb-6 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded"
      >
        ← Voltar para o painel
      </button>
      

      {/* Nova Categoria */}
      <div className="flex gap-4 mb-10">
        <input
          type="text"
          className="flex-grow border border-gray-300 rounded-lg px-5 py-3 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] transition"
          placeholder="Nova categoria"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addCategory()}
        />
        <button
          onClick={addCategory}
          className="bg-[#1E3A5F] hover:bg-[#163254] text-white font-semibold px-6 rounded-lg shadow-md transition"
        >
          Adicionar
        </button>
      </div>

      {/* Lista de Categorias */}
      <ul className="space-y-5">
        {categories.map((c) => (
          <li
            key={c.id}
            className="flex justify-between items-center border-b border-gray-200 pb-4"
          >
            {editingId === c.id ? (
              <div className="flex gap-3 w-full">
                <input
                  className="flex-grow border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600 transition"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveEdit(c.id)}
                  autoFocus
                />
                <button
                  onClick={() => saveEdit(c.id)}
                  className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-4 py-2 font-semibold transition"
                >
                  Salvar
                </button>
                <button
                  onClick={cancelEdit}
                  className="bg-gray-300 hover:bg-gray-400 rounded-lg px-4 py-2 transition"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <>
                <span className="text-gray-800 font-medium">{c.name}</span>
                <div className="flex gap-6 text-sm">
                      <button
                        onClick={() => startEdit(c)}
                        className="p-2 rounded-md bg-[#1E3A5F] hover:bg-[#16324B] text-white"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => deleteCategory(c.id)}
                        className="p-2 rounded-md bg-red-600 hover:bg-red-700 text-white"
                      >
                        <FaTrash />
                      </button>

                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
