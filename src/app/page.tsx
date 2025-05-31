"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  // Estados de controle
  const [showRegister, setShowRegister] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Para alteração de senha
  const [changeEmail, setChangeEmail] = useState("");
  const [changeNewPassword, setChangeNewPassword] = useState("");

  const [message, setMessage] = useState("");

  // Registro
  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    const response = await fetch("http://localhost:4000/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: registerName,
        email: registerEmail,
        password: registerPassword,
      }),
    });

    const text = await response.text();
    setMessage(text);

    setRegisterName("");
    setRegisterEmail("");
    setRegisterPassword("");
    setShowRegister(false);
  }

  // Login
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:4000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        localStorage.setItem("token", data.token);
        router.push("/dashboard");
      } else {
        setMessage(data.message || "Senha incorreta.");
      }
    } catch {
      setMessage("Erro ao fazer login.");
    }
  }

  // Alterar senha (sem token, só email + nova senha)
  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();

    const response = await fetch("http://localhost:4000/change-password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: changeEmail,
        newPassword: changeNewPassword,
      }),
    });

    const text = await response.text();

    if (response.ok) {
      setMessage("Senha atualizada com sucesso!");
      setChangeEmail("");
      setChangeNewPassword("");
      setShowChangePassword(false);
    } else {
      setMessage(text || "Erro ao atualizar a senha.");
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 px-6 py-10">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">
        <h1 className="text-4xl font-extrabold mb-8 text-center bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 bg-clip-text text-transparent tracking-wide">
          doadev
        </h1>

        {message && (
          <div className="mb-6 px-4 py-3 bg-red-100 text-red-800 border border-red-300 rounded-md shadow-sm select-text">
            {message}
          </div>
        )}

        {!showRegister && !showChangePassword && (
          <>
            {/* Login */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-purple-700 border-b border-purple-300 pb-2">
                Login
              </h2>
              <form onSubmit={handleLogin} className="flex flex-col space-y-4">
                <input
                  type="email"
                  placeholder="Email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300 transition"
                />
                <input
                  type="password"
                  placeholder="Senha"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300 transition"
                />
                <button
                  type="submit"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-pink-600 hover:to-purple-600 text-white font-semibold py-3 rounded-xl shadow-lg transition"
                >
                  Entrar
                </button>
              </form>
            </section>

            <div className="flex flex-col space-y-2 text-center">
              <button
                onClick={() => {
                  setShowRegister(true);
                  setMessage("");
                }}
                className="text-sm text-purple-600 font-medium hover:underline"
              >
                Não tem uma conta? Registrar-se
              </button>

              <button
                onClick={() => {
                  setShowChangePassword(true);
                  setMessage("");
                }}
                className="text-sm text-purple-600 font-medium hover:underline"
              >
                Alterar senha
              </button>
            </div>
          </>
        )}

        {/* Registro */}
        {showRegister && (
          <>
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-purple-700 border-b border-purple-300 pb-2">
                Registrar
              </h2>
              <form
                onSubmit={handleRegister}
                className="flex flex-col space-y-4"
              >
                <input
                  type="text"
                  placeholder="Nome"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  required
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300 transition"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  required
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300 transition"
                />
                <input
                  type="password"
                  placeholder="Senha"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  required
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300 transition"
                />
                <button
                  type="submit"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-pink-600 hover:to-purple-600 text-white font-semibold py-3 rounded-xl shadow-lg transition"
                >
                  Registrar
                </button>
              </form>
            </section>

            <button
              onClick={() => setShowRegister(false)}
              className="text-sm text-purple-600 font-medium hover:underline block mx-auto"
            >
              Já tem uma conta? Fazer login
            </button>
          </>
        )}

        {/* Alterar senha */}
        {showChangePassword && (
          <>
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-purple-700 border-b border-purple-300 pb-2">
                Alterar Senha
              </h2>
              <form
                onSubmit={handleChangePassword}
                className="flex flex-col space-y-4"
              >
                <input
                  type="email"
                  placeholder="Email"
                  value={changeEmail}
                  onChange={(e) => setChangeEmail(e.target.value)}
                  required
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300 transition"
                />
                <input
                  type="password"
                  placeholder="Nova senha"
                  value={changeNewPassword}
                  onChange={(e) => setChangeNewPassword(e.target.value)}
                  required
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300 transition"
                />
                <button
                  type="submit"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-pink-600 hover:to-purple-600 text-white font-semibold py-3 rounded-xl shadow-lg transition"
                >
                  Atualizar Senha
                </button>
              </form>
            </section>

            <button
              onClick={() => setShowChangePassword(false)}
              className="text-sm text-purple-600 font-medium hover:underline block mx-auto"
            >
              Voltar
            </button>
          </>
        )}
      </div>
    </div>
  );
}
